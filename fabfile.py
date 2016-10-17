import atexit
from fabric.context_managers import shell_env, settings, hide
from fabric.contrib.files import exists
from fabric.operations import put, local, run
from fabric.utils import puts, error

_remote_app_dir = '/var/apps/sira/'
_original_branch = None


# TODO init tools


def _get_django_settings_module(env):
    return 'sira.settings.{}'.format(env)


def _stop_remote_app_and_clean():
    if exists('{}docker-compose.yml'.format(_remote_app_dir)):
        run('(cd {} && docker-compose stop && docker-compose rm -f)'.format(_remote_app_dir))
    else:
        puts('No application launched')
    version_file_path = '{}version'.format(_remote_app_dir)
    if exists(version_file_path):
        app_version = run('cat {}'.format(version_file_path))
        run('rm -rf {}'.format(_remote_app_dir))
        puts('Application {} stopped and cleaned'.format(app_version))
    else:
        puts('No version deployed')


def _save_local_repo_initial_state():
    """
    Save and get local repo initial state info
    :return: local repo current branch
    """
    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        current_branch = local('git rev-parse --abbrev-ref HEAD', capture=True)
        local('git stash')
    puts('Saved working branch: {} and stashed changes'.format(current_branch))
    global _original_branch
    _original_branch = current_branch
    return current_branch


def _checkout_version(version):
    """
    Checkout tag, fail if it does not exist
    :param version: The version to deploy
    """
    with settings(hide('warnings', 'running', 'stdout', 'stderr'), warn_only=True):
        result = local('git rev-parse {}'.format(version))
    if result.failed:
        error('You must create git tag for your version "{}" before deploying it'.format(version))
    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        local('git checkout {}'.format(version))
    puts('Version {} checked out'.format(version))


def _upload_static(env):
    """
    Upload sira static files to server
    """
    with shell_env(DJANGO_SETTINGS_MODULE=_get_django_settings_module(env)):
        # Build static
        local('python ./manage.py collectstatic -v0 --no-input')
        local('python ./manage.py compress')
    # Upload
    put('static', _remote_app_dir)
    puts('Static files uploaded to server')


def _upload_media(include_media):
    """
    Upload sira media files to server if include_media set to True
    """
    # Upload
    if include_media:
        put('media', _remote_app_dir)
        puts('Media files uploaded to server')
    else:
        puts('Media not included')


def _get_sira_docker_image_filename(version):
    return 'sira.{}.docker'.format(version)


def _push_sira_docker_image(version, env, force_image_build):
    image_id = 'ekougs/sira:{}'.format(version)
    sira_docker_image_filename = _get_sira_docker_image_filename(version)
    docker_file_name = 'Dockerfile'

    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        image_exists = local('docker images -q {} 2> /dev/null'.format(image_id), capture=True)
    if not force_image_build and image_exists:
        puts('Using existing image {}'.format(image_id))
    else:
        with shell_env(VERSION=version, ENV=env, DJANGO_SETTINGS_MODULE=_get_django_settings_module(env)):
            # Generate Dockerfile from template
            local('cat Dockerfile.tmplt | envsubst > {}'.format(docker_file_name))
            local('docker build -t {} .'.format(image_id))
            local('rm -f {}'.format(docker_file_name))

    local('docker save -o {} {}'.format(sira_docker_image_filename, image_id))
    put(sira_docker_image_filename, _remote_app_dir)
    local('rm {}'.format(sira_docker_image_filename))


def push_docker_compose(version, env):
    _push_docker_compose(version, env)


def _push_docker_compose(version, env):
    """
    Generate docker compose file from the template matching the env and upload to server
    :param version: the version to deploy
    :param env: the env settings to deploy
    :return:
    """
    docker_compose_filename = 'docker-compose.yml'

    with shell_env(VERSION=version, STATIC_DIR='/var/apps/sira/static', MEDIA_DIR='/var/apps/sira/media'):
        local('cat docker-compose.{}.tmplt | envsubst > {}'.format(env, docker_compose_filename))

    put(docker_compose_filename, _remote_app_dir)
    local('rm {}'.format(docker_compose_filename))
    puts('Sira docker-compose file uploaded')


def _push_deployment_assets(version, env, force_image_build, include_media):
    # Create app dir if it does not exist
    run('mkdir -p {}'.format(_remote_app_dir))

    _upload_static(env)

    _upload_media(include_media)

    # Generate and upload version file
    local('echo {} > version'.format(version))
    put('version', _remote_app_dir)
    local('rm version')

    # Upload files needed by docker compose images
    put('docker', _remote_app_dir)

    _push_sira_docker_image(version, env, force_image_build)

    _push_docker_compose(version, env)


def _launch_app(version, postgres_user, postgres_password, env):
    with shell_env(VERSION=version, POSTGRES_USER=postgres_user, POSTGRES_PASSWORD=postgres_password, ENV=env,
                   DJANGO_SETTINGS_MODULE=_get_django_settings_module(env)):
        load_sira_img_cmd = 'docker load -i {}'.format(_get_sira_docker_image_filename(version))
        build_app_cmd = 'docker-compose build'
        launch_app_cmd = 'docker-compose up -d'.format(version)
        run('(cd {} && {} && {} && {})'.format(_remote_app_dir, load_sira_img_cmd, build_app_cmd, launch_app_cmd))
    puts('Sira app {} launched'.format(version))


def upload_nginx():
    put('nginx.docker', '~')
    run('docker load -i ~/nginx.docker')


def deploy(version, postgres_user, postgres_password, env='prod', force_image_build=False, include_media=False):
    """
    Create tag and deploy application to server
    :param include_media: if you want to push your local media files, default to False
    :param force_image_build: True if you want to force sira docker image build, default to False
    :param postgres_password: postgres password to use
    :param postgres_user: postgres user to use
    :param env: The env for settings
    :param version: The version to deploy
    :return:
    """

    _save_local_repo_initial_state()
    _checkout_version(version)

    _stop_remote_app_and_clean()

    _push_deployment_assets(version, env, force_image_build, include_media)

    _launch_app(version, postgres_user, postgres_password, env)


# Always invoked before fab completely exists even when error
@atexit.register
def _reset_local_repo_to_initial_state():
    """
    Reset local repo to its initial state
    """
    if _original_branch is None:
        return
    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        local('git checkout {}'.format(_original_branch))
        local('git stash pop')
    puts('Initial repo state restored. Original branch "{}" checked out ; changes unstashed'.format(_original_branch))
