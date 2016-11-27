FROM tutum/nginx

RUN apt-get update

RUN apt-get install -y logrotate
RUN mkdir -p /etc/logrotate.d/
ADD logrotate_nginx /etc/logrotate.d/nginx

RUN rm /etc/nginx/sites-enabled/default
ADD sites-enabled/ /etc/nginx/sites-enabled

ADD nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/shared_conf
ADD shared_conf /etc/nginx/shared_conf

RUN chmod -R g+w /var/lib/nginx
RUN chgrp -R www-data var/lib/nginx/
RUN usermod -a -G www-data root
USER www-data
