#!/bin/bash -x
cd "$(dirname "$0")"

source "launch-helpers.sh"

npm run db:start
wait_for_postgres
npm run start:prod &
wait_for_server
