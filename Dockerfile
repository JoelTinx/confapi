FROM alpine:3.13.1

RUN \
  apk update; \
  apk add mysql git \
