FROM python:3.4.5


# Install ffmpeg and make it executable
RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz
RUN tar -xvf ffmpeg-release-64bit-static.tar.xz && rm ffmpeg-release-64bit-static.tar.xz && \
mv ffmpeg-*-64bit-static/ffmpeg /usr/local/bin && rm -rf ffmpeg-*-64bit-static
RUN chmod uga+x /usr/local/bin/ffmpeg

WORKDIR /usr/src/sira
# Copy requirements to use docker layers cache if not changed
ADD ./requirements.txt /usr/src/sira/requirements.txt

# Getting all project's dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

ADD ./manage.py /usr/src/sira/manage.py
ADD ./docker /usr/src/sira/docker
ADD ./sira /usr/src/sira/sira

RUN mkdir -p /var/log/sira
RUN python manage.py collectstatic --noinput
RUN DJANGO_SETTINGS_MODULE="sira.settings.prod" SECRET_KEY="dummy_secret_to_compress" python manage.py compress

# Change the ownersihp of these directories as they are used during container execution
RUN chown -R www-data:www-data /usr/src/sira
RUN chown -R www-data:www-data /var/log/sira
RUN mkdir -p /var/www
RUN chown -R www-data:www-data /var/www/
RUN chown -R www-data:www-data /usr/local/lib/python3.4/

# Change user to run the rest of the image build and to run the container
USER www-data
