FROM alpine:3.21

RUN apk upgrade \
  && apk add --no-cache \
  deno

RUN adduser -D deno

USER deno

WORKDIR /app
COPY --chown=deno:deno . /app

CMD ["deno", "run", "start"]
