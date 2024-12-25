#!/bin/bash -ex

docker container stop odysseus-database || true
docker container rm odysseus-database || true
npm run db:start
./wait-for-db.sh
npm run db:migrate
npm run db:seed
