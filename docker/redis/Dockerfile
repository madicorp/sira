FROM redis:3.0.7

RUN apt-get update

RUN apt-get install -y logrotate
RUN mkdir -p /etc/logrotate.d/
ADD logrotate_redis /etc/logrotate.d/redis

ADD redis.conf /etc/redis.conf
