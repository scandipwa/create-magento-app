FROM debian:bookworm-slim

ENV SYNC_FROM_DIR=/data/from
ENV SYNC_TO_DIR=/data/to

RUN set -eux; \
    apt-get update -y

RUN set -eux; \
    apt-get install -y --no-install-recommends \
    inotify-tools \
    rsync

WORKDIR /app

COPY ./entrypoint.sh .

RUN chmod +x entrypoint.sh

CMD ./entrypoint.sh