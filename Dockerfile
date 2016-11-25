FROM python:3.4.5

RUN mkdir /usr/src/sira
WORKDIR /usr/src/sira

# Install ffmpeg
RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz
RUN tar -xvf ffmpeg-release-64bit-static.tar.xz && rm ffmpeg-release-64bit-static.tar.xz && \
mv ffmpeg-*-64bit-static/ffmpeg /usr/local/bin && rm -rf ffmpeg-*-64bit-static

# Copy requirements to use docker layers cache if not changed
ADD ./requirements.txt /usr/src/sira/requirements.txt

# Getting all project's dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

ADD ./manage.py /usr/src/sira/manage.py
ADD ./docker /usr/src/sira/docker
ADD ./sira /usr/src/sira/sira

RUN python manage.py collectstatic --noinput
RUN mkdir -p /var/log/sira
RUN DJANGO_SETTINGS_MODULE="sira.settings.prod" SECRET_KEY="dummy_secret_to_compress" python manage.py compress
