# docker build . -t pyrabot
# docker run --rm --volume $(pwd)/../ztm-routes.json:/tmp/ztm-routes.json pyrabot python gtfs_ztm.py
FROM python:3.12-slim

WORKDIR /opt/pyrabot/
RUN chown nobody /opt/pyrabot/
USER nobody
ENV HOME /opt/pyrabot

WORKDIR /opt/pyrabot/scripts
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip list

ENV ROUTERS_PATH '/tmp/ztm-routes.json'

COPY gtfs_ztm.py .
VOLUME /tmp/ztm-routes.json
