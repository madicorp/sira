import atexit

from fabric.context_managers import shell_env, settings, hide
from fabric.contrib.files import exists
from fabric.operations import put, local, run, sudo
from fabric.utils import puts, error

_devops_user = 'devops'
_remote_app_dir = '/var/apps/'
_remote_sira_app_dir = '{}sira/'.format(_remote_app_dir)
_original_branch = None


def _create_devops_user_and_group(pwd):
    # Create group and user
    sudo('adduser --disabled-password --gecos "" {}'.format(_devops_user))
    sudo('echo "{}:{}" | sudo chpasswd'.format(_devops_user, pwd))


def _add_user_public_ssh_key_to_authorized_users():
    # get current user public key
    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        public_key = local('cat ~/.ssh/id_rsa.pub', capture=True)
    # create ssh dir if it does not exist
    ssh_dir = '/home/{}/.ssh/'.format(_devops_user)
    sudo('mkdir -p {}'.format(ssh_dir))
    sudo('chown {0}:{0} {1}'.format(_devops_user, ssh_dir))
    # put public key in authorized keys
    authorized_keys_file = '{}authorized_keys'.format(ssh_dir)
    sudo('echo {} >> {}'.format(public_key, authorized_keys_file))
    sudo('chown {0}:{0} {1}'.format(_devops_user, authorized_keys_file))
    # if anyone other than the owner is able to write, authorized users won't be able to login without
    # host user's password
    sudo('chmod 755 {}'.format(authorized_keys_file))


def _create_apps_dir():
    sudo('mkdir -p {}'.format(_remote_app_dir))
    sudo('chown {0}:{0} {1}'.format(_devops_user, _remote_app_dir))


def _install_docker_prerequisites():
    sudo('apt-get update')
    sudo('apt-get install -y apt-transport-https ca-certificates')
    sudo(
        'apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D')
    docker_list = '/etc/apt/sources.list.d/docker.list'
    sudo('touch {0} && chmod 644 {0}'.format(docker_list))
    sudo('echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" > {}'.format(docker_list))
    sudo('apt-get update')
    sudo('apt-get purge lxc-docker')
    sudo('apt-cache policy docker-engine')
    sudo('apt-get update')
    sudo('apt-get install -y linux-image-extra-$(uname -r) linux-image-extra-virtual')


def _install_docker():
    _install_docker_prerequisites()

    # Actual install
    sudo('apt-get update')
    sudo('apt-get install -y docker-engine')

    # Make docker usable without sudo ; it will be effective after a logout/login
    sudo('usermod -aG docker $USER')
    sudo('usermod -aG docker {}'.format(_devops_user))


def _install_docker_compose():
    run(
        'curl -L https://github.com/docker/compose/releases/download/1.8.1/docker-compose-`uname -s`-`uname -m` > docker-compose')
    sudo('mv docker-compose /usr/local/bin/')
    sudo('chmod 751 /usr/local/bin/docker-compose')
    sudo('chgrp docker /usr/local/bin/docker-compose')


def _get_django_settings_module(env):
    return 'sira.settings.{}'.format(env)


def _stop_remote_app_and_clean():
    if exists('{}docker-compose.yml'.format(_remote_sira_app_dir)):
        run('(cd {} && docker-compose stop && docker-compose rm -f)'.format(_remote_sira_app_dir))
    else:
        puts('no application launched')
    version_file_path = '{}version'.format(_remote_sira_app_dir)
    if exists(version_file_path):
        app_version = run('cat {}'.format(version_file_path))
        run('rm -rf {}'.format(_remote_sira_app_dir))
        puts('application {} stopped and cleaned'.format(app_version))
    else:
        puts('no version deployed')


def _save_local_repo_initial_state():
    """
    save and get local repo initial state info
    :return: local repo current branch
    """
    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        current_branch = local('git rev-parse --abbrev-ref head', capture=True)
        local('git stash')
    puts('saved working branch: {} and stashed changes'.format(current_branch))
    global _original_branch
    _original_branch = current_branch
    return current_branch


def _checkout_version(version):
    """
    checkout tag, fail if it does not exist
    :param version: the version to deploy
    """
    with settings(hide('warnings', 'running', 'stdout', 'stderr'), warn_only=True):
        result = local('git rev-parse {}'.format(version))
    if result.failed:
        error('you must create git tag for your version "{}" before deploying it'.format(version))
    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        local('git checkout {}'.format(version))
    puts('version {} checked out'.format(version))


def _upload_static(env):
    """
    upload sira static files to server
    """
    with shell_env(DJANGO_SETTINGS_MODULE=_get_django_settings_module(env)):
        # build static
        puts('Compressing with settings {}'.format(_get_django_settings_module(env)))
        local('python ./manage.py collectstatic -v0 --no-input')
        local('python ./manage.py compress')
    # upload
    put('static', _remote_sira_app_dir)
    puts('static files uploaded to server')


def _upload_media(include_media):
    """
    upload sira media files to server if include_media set to True
    """
    # upload
    if include_media:
        put('media', _remote_sira_app_dir)
        puts('media files uploaded to server')
    else:
        puts('media not included')


def _get_sira_docker_image_filename(version):
    return 'sira.{}.docker'.format(version)


def _push_sira_docker_image(version, env, force_image_build):
    image_id = 'ekougs/sira:{}'.format(version)
    sira_docker_image_filename = _get_sira_docker_image_filename(version)
    docker_file_name = 'dockerfile'

    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        image_exists = local('docker images -q {} 2> /dev/null'.format(image_id), capture=True)
    if not force_image_build and image_exists:
        puts('using existing image {}'.format(image_id))
    else:
        with shell_env(VERSION=version, ENV=env, DJANGO_SETTINGS_MODULE=_get_django_settings_module(env)):
            # generate dockerfile from template
            local('cat dockerfile.tmplt | envsubst > {}'.format(docker_file_name))
            local('docker build -t {} .'.format(image_id))
            local('rm -f {}'.format(docker_file_name))

    local('docker save -o {} {}'.format(sira_docker_image_filename, image_id))
    put(sira_docker_image_filename, _remote_sira_app_dir)
    local('rm {}'.format(sira_docker_image_filename))


def push_docker_compose(version, env):
    _push_docker_compose(version, env)


def _push_docker_compose(version, env):
    """
    generate docker compose file from the template matching the env and upload to server
    :param version: the version to deploy
    :param env: the env settings to deploy
    :return:
    """
    docker_compose_filename = 'docker-compose.yml'

    with shell_env(VERSION=version, STATIC_DIR='/var/apps/sira/static', MEDIA_DIR='/var/apps/sira/media'):
        local('cat docker-compose.{}.tmplt | envsubst > {}'.format(env, docker_compose_filename))

    put(docker_compose_filename, _remote_sira_app_dir)
    local('rm {}'.format(docker_compose_filename))
    puts('sira docker-compose file uploaded')


def _push_deployment_assets(version, env, force_image_build, include_media):
    # create app dir if it does not exist
    run('mkdir -p {}'.format(_remote_sira_app_dir))

    _upload_static(env)

    _upload_media(include_media)

    # generate and upload version file
    local('echo {} > version'.format(version))
    put('version', _remote_sira_app_dir)
    local('rm version')

    # upload files needed by docker compose images
    put('docker', _remote_sira_app_dir)

    _push_sira_docker_image(version, env, force_image_build)

    _push_docker_compose(version, env)


def _launch_app(version, postgres_user, postgres_password, env):
    with shell_env(VERSION=version, POSTGRES_USER=postgres_user, POSTGRES_PASSWORD=postgres_password, ENV=env,
                   DJANGO_SETTINGS_MODULE=_get_django_settings_module(env)):
        load_sira_img_cmd = 'docker load -i {}'.format(_get_sira_docker_image_filename(version))
        build_app_cmd = 'docker-compose build'
        launch_app_cmd = 'docker-compose up -d'.format(version)
        run('(cd {} && {} && {} && {})'.format(_remote_sira_app_dir, load_sira_img_cmd, build_app_cmd, launch_app_cmd))
    puts('sira app {} launched'.format(version))


def init_tools(pwd):
    """
    Init devops user and tools in an ubuntu deployment environment
    Must be launched once and only once AND before deploying app
    :param pwd: devops password
    """
    _create_devops_user_and_group(pwd)
    _add_user_public_ssh_key_to_authorized_users()
    _create_apps_dir()
    _install_docker()
    _install_docker_compose()


def install_docker_images():
    """
    Load docker images to deployment environment
    """
    for image_name in ['nginx', 'postgres', 'python', 'redis']:
        docker_image = '{}.docker'.format(image_name)
        put(docker_image, '~')
        run('docker load -i {}'.format(docker_image))


def deploy(version, postgres_user, postgres_password, env='prod', force_image_build=False, include_media=False):
    """
    create tag and deploy application to server
    :param include_media: if you want to push your local media files, default to False
    :param force_image_build: True if you want to force sira docker image build, default to False
    :param postgres_password: postgres password to use
    :param postgres_user: postgres user to use
    :param env: the env for settings
    :param version: the version to deploy
    :return:
    """

    _save_local_repo_initial_state()
    _checkout_version(version)

    _stop_remote_app_and_clean()

    _push_deployment_assets(version, env, force_image_build, include_media)

    _launch_app(version, postgres_user, postgres_password, env)


# always invoked before fab task completely exits even when error
@atexit.register
def _reset_local_repo_to_initial_state():
    """
    reset local repo to its initial state
    """
    if _original_branch is None:
        return
    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        local('git checkout {}'.format(_original_branch))
        local('git stash pop')
    puts('initial repo state restored. original branch "{}" checked out ; changes unstashed'.format(_original_branch))
