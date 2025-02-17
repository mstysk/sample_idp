FROM alpine:3.21

RUN apk upgrade \
  && apk add --no-cache \
  deno

RUN adduser -D deno

WORKDIR /app
COPY . /app

USER deno

CMD ["deno", "run", "start"]
