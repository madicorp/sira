FROM python:3.4.5

RUN mkdir /usr/src/sira
WORKDIR /usr/src/sira

# Copy requirements to use docker layers cache if not changed
ADD ./requirements.txt /usr/src/sira/requirements.txt

# Getting all project's dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

ADD ./static /usr/src/sira/static

ADD ./docker /usr/src/sira/docker
ADD ./manage.py /usr/src/sira/manage.py
ADD ./sira /usr/src/sira/sira
