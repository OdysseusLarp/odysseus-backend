#!/bin/bash -ex

source launch-helpers.sh

docker container stop odysseus-database || true
docker container rm odysseus-database || true
npm run db:start
wait_for_postgres
npm run db:migrate
npm run db:seed
