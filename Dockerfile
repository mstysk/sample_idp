FROM alpine:3.21

RUN apk upgrade \
  && apk add --no-cache \
  deno

COPY . .

USER deno

CMD ["deno", "run", "start"]
