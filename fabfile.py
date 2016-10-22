import atexit
import os
import platform
import time

import urllib3
from fabric.context_managers import shell_env, settings, hide
from fabric.contrib.files import exists
from fabric.operations import put, local, run, sudo
from fabric.utils import puts, error
from urllib3.exceptions import RequestError

_devops_user = 'devops'
_remote_app_dir = '/var/apps/'
_remote_sira_app_dir = '{}sira/'.format(_remote_app_dir)
_original_branch = None
_docker_compose_filename = 'docker-compose.yml'
_dockerfile_filename = 'Dockerfile'


def _is_on_windows():
    return 'Windows' in platform.platform()


def _local_execution(fn_windows_exec, fn_unix_exec):
    if _is_on_windows():
        return fn_windows_exec()
    return fn_unix_exec()


def _create_devops_user_and_group(pwd):
    # Create group and user
    sudo('adduser --disabled-password --gecos "" {}'.format(_devops_user))
    sudo('echo "{}:{}" | sudo chpasswd'.format(_devops_user, pwd))


def _get_pub_key_location_windows():
    return os.path.join(os.getenv('userprofile'), '.ssh/id_rsa.pub')


def _get_pub_key_location_unix():
    return '~/.ssh/id_rsa.pub'


def _get_pub_key_content():
    pub_key_location = _local_execution(_get_pub_key_location_windows, _get_pub_key_location_unix)
    with open(pub_key_location, 'r') as pub_key_file:
        return pub_key_file.read().replace('\n', '')


def _add_user_public_ssh_key_to_authorized_users():
    # get current user public key
    public_key = _get_pub_key_content()
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
    recv_key = '58118E89F3A912897C070ADBF76221572C52609D'
    sudo('apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys {}'.format(recv_key))
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
    download_docker_compose = \
        'curl -L https://github.com/docker/compose/releases/download/1.8.1/docker-compose-`uname -s`-`uname -m`'
    run('{} > docker-compose'.format(download_docker_compose))
    sudo('mv docker-compose /usr/local/bin/')
    sudo('chmod 751 /usr/local/bin/docker-compose')
    sudo('chgrp docker /usr/local/bin/docker-compose')


def _get_django_settings_module(env):
    sira_settings = 'sira.settings.{}'.format(env)
    if _is_on_windows():
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", sira_settings)
    return sira_settings


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
        tag_exists = local('git rev-parse {}'.format(version))
    if tag_exists.failed:
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
        # Delete static dir cross platform
        # We do not check rights as we suppose running user owns this git repo
        if exists('static'):
            _local_execution(lambda: local('rmdir /s /q static'), lambda: local('rm -rf static'))
        local('python manage.py collectstatic -v0 --no-input')
        local('python manage.py compress')
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


def _get_sira_image_id(version):
    return 'ekougs/sira:{}'.format(version)


def _build_sira_image(version, env, force_image_build=False):
    image_id = _get_sira_image_id(version)
    with settings(hide('warnings', 'running', 'stdout', 'stderr')):
        image_exists = local('docker images -q {} 2> /dev/null'.format(image_id), capture=True)
    if not force_image_build and image_exists:
        puts('using existing image {}'.format(image_id))
    else:
        with shell_env(VERSION=version, ENV=env, DJANGO_SETTINGS_MODULE=_get_django_settings_module(env)):
            # generate dockerfile from template
            local('cat dockerfile.tmplt | envsubst > {}'.format(_dockerfile_filename))
            local('docker build -t {} .'.format(image_id))
            local('rm -f {}'.format(_dockerfile_filename))


def _build_docker_compose_file(version, env):
    os.environ['VERSION'] = version
    os.environ['STATIC_DIR'] = '/var/apps/sira/static'
    os.environ['MEDIA_DIR'] = '/var/apps/sira/media'
    with open('docker-compose.{}.tmplt'.format(env), 'r') as templated_file, \
            open(_docker_compose_filename, 'w') as output_file:
        for templated_line in templated_file:
            output_file.writelines(os.path.expandvars(templated_line))


def _delete_if_exists(file_path):
    try:
        os.remove(file_path)
    except OSError:
        pass


def _push_docker_compose(version, env):
    """
    generate docker compose file from the template matching the env and upload to server
    :param version: the version to deploy
    :param env: the env settings to deploy
    :return:
    """
    _build_docker_compose_file(version, env)

    put(_docker_compose_filename, _remote_sira_app_dir)
    _delete_if_exists(_docker_compose_filename)
    puts('sira docker-compose file uploaded')


def _push_deployment_assets(version, env, include_media):
    # create app dir if it does not exist
    run('mkdir -p {}'.format(_remote_sira_app_dir))

    _upload_static(env)

    _upload_media(include_media)

    # generate and upload version file
    version_filename = 'version'
    with open(version_filename, 'w') as version_file:
        version_file.writelines(version)
    put(version_filename, _remote_sira_app_dir)
    _delete_if_exists(version_filename)

    # upload files needed by docker compose images
    put('docker', _remote_sira_app_dir)

    put(_dockerfile_filename)

    _push_docker_compose(version, env)


def _launch_app(version, postgres_user, postgres_password, env):
    with shell_env(VERSION=version, POSTGRES_USER=postgres_user, POSTGRES_PASSWORD=postgres_password, ENV=env,
                   DJANGO_SETTINGS_MODULE=_get_django_settings_module(env)):
        build_sira_docker_img = 'docker build -t {} .'.format(version)
        mv_to_sira_app_dir = 'cd {}'.format(_remote_sira_app_dir)
        build_app_cmd = 'docker-compose build'
        launch_app_cmd = 'docker-compose up -d'
        run('({} && {} && {} && {})'.format(mv_to_sira_app_dir, build_sira_docker_img, build_app_cmd, launch_app_cmd))
        # The next command remove the ekougs/sira dangling containers by taking their IDs
        # It's to avoid piling up images that will take too much space
        run('docker rmi $(docker images -f "dangling=true" | grep ekougs/sira | tr -s ' ' | cut -f3 -d' ')')
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
    images = {'nginx': 'tutum/nginx:latest', 'postgres': 'postgres:9.6.0', 'python': 'python:3.4.5',
              'redis': 'redis:3.0.7', 'elasticsearch': 'elasticsearch:1.7.5'}
    for image_name in images:
        docker_image = '{}.docker'.format(image_name)
        docker_image_name_with_tag = images[image_name]
        if not os.path.exists(docker_image):
            puts('Archived image {} for {} not found, generating it'.format(docker_image,
                                                                            docker_image_name_with_tag))
            local('docker save -o {} {}'.format(docker_image, docker_image_name_with_tag))
        else:
            puts('Archived image {} for {} found, using it'.format(docker_image, docker_image_name_with_tag))
        put(docker_image, '~')
        run('docker load -i {}'.format(docker_image))


def deploy(version, postgres_user, postgres_password, env='prod', include_media=False,
           push_local_image=False):
    """
    create tag and deploy application to server
    :param push_local_image: if you want to push local image to deployment environment rather than use dockerhub
    :param include_media: if you want to push your local media files, default to False
    :param postgres_password: postgres password to use
    :param postgres_user: postgres user to use
    :param env: the env for settings
    :param version: the version to deploy
    :return:
    """

    _save_local_repo_initial_state()
    _checkout_version(version)

    _stop_remote_app_and_clean()

    _push_deployment_assets(version, env, include_media)

    _launch_app(version, postgres_user, postgres_password, env)


def local_docker_compose(version, env='dev'):
    """
    Launch a docker-compose with current sources on the provided environment. Useful to simulate before deployment
    :param version: the version to
    :param env: the environment to launch locally ; default is 'dev'
    """
    _build_sira_image(version, env, True)

    _build_docker_compose_file(version, env)

    stop_app_cmd = 'docker-compose stop'
    remove_app_containers_cmd = 'docker-compose rm -f'
    build_app_cmd = 'docker-compose build'
    launch_app_cmd = 'docker-compose up -d'
    local('{} && {} && {} && {}'.format(stop_app_cmd, remove_app_containers_cmd, build_app_cmd, launch_app_cmd))


def _wait_for(host, port):
    time_to_wait = 5
    http_address = 'http://{}:{}'.format(host, port)
    while time_to_wait < 60:
        try:
            urllib3.connection_from_url(http_address).request('GET', '/')
            return
        except RequestError:
            puts('Waiting {}s for {}'.format(time_to_wait, http_address))
            time.sleep(time_to_wait)
            time_to_wait *= 2
    error('Failed to wait for {}'.format(http_address))


def local_launch():
    """
    Directly launch the server without container. Useful for hot reload in DEV mode
    """
    # If elasticsearch launch fails, it is already launched and doesn't need to be relaunched
    with settings(hide('warnings', 'running', 'stdout', 'stderr'), warn_only=True):
        puts('Removing elasticsearch container')
        local('docker rm sira_elasticsearch_1')
        puts('Running elasticsearch container')
        has_run = local('docker run -d --name sira_elasticsearch_1 -p 9200:9200 elasticsearch:1.7.5')
        if not has_run.failed:
            _wait_for('localhost', 9200)
    local('./local_launch.sh')

    # always invoked before fab task completely exits even when error


def build_sira_image(version, env):
    """
    Build sira docker image based on the tagged version
    :param version: the docker version to build
    :param env: the environment to build
    """
    _save_local_repo_initial_state()
    _checkout_version(version)
    _build_sira_image(version, env, True)


@atexit.register
def _reset_local_repo_to_initial_state():
    """
    reset local repo to its initial state
    """
    if _original_branch is None:
        return
    with settings(hide('warnings', 'running', 'stdout', 'stderr'), warn_only=True):
        local('git checkout {}'.format(_original_branch))
        local('git stash pop')
    puts('initial repo state restored. original branch "{}" checked out ; changes unstashed'.format(
        _original_branch))
