#!/bin/bash -ex

source launch-helpers.sh

# Cleanup for Docker:
# docker container stop odysseus-database || true
# docker container rm odysseus-database || true
# npm run db:start
# wait_for_postgres

# Cleanup for installed PostgreSQL (connects to template1 database to avoid issues)
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d template1 -c "DROP DATABASE IF EXISTS $DB_NAME;"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d template1 -c "CREATE DATABASE $DB_NAME;"
echo "Database $DB_NAME dropped and recreated."

npm run db:migrate
npm run db:seed
