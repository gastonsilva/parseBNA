# parse BNA

A simple parser for BNA HB transactions.

## Requirements

- docker with buildkit enabled

## Usage

```bash
$ docker run --rm -p 3000:3000 $(docker build -q .)
$ curl -X POST localhost:3000/parseBNA/ \
    -H 'content-type: application/json' \
    -H 'accept: application-json' \
    -d '{"username":"<user>","password":"<password>","accountNumber":"<accountNumber>"}'
```
