#!/bin/sh
set -e

until npx ts-node ./scripts/check-db-connection.ts; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - continuing"
