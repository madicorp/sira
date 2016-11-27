import socket
import time
import logging

log = logging.getLogger(__name__)


class ApiLoggerMiddleware(object):
    @staticmethod
    def process_request(request):
        request.start_time = time.time()

    @staticmethod
    def process_response(request, response):

        if response['content-type'] == 'application/json':
            if getattr(response, 'streaming', False):
                response_body = '<<<Streaming>>>'
            else:
                response_body = response.content
        else:
            response_body = '<<<Not JSON>>>'

        log_data = {
            'user': request.user.pk,
            'remote_address': request.META['REMOTE_ADDR'],
            'server_hostname': socket.gethostname(),
            'request_method': request.method,
            'request_path': request.get_full_path(),
            'request_body': request.body,
            'response_status': response.status_code,
            'response_body': response_body,
            'run_time': time.time() - request.start_time,
        }

        log.info(log_data)

        return response
