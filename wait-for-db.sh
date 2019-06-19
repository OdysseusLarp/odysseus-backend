#!/bin/sh
set -e

until node ./scripts/check-db-connection.js; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - continuing"
