#!/bin/bash

# Run this script to seed starmap data to a remote database from local CSV files

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DATA_DIR="$DIR/../db/data"

source "$DIR/../.env"

export PGPASSWORD="$DB_PASSWORD"

# Insert data from CSVs
psql -h $DB_HOST -U $DB_USER -d $DB_NAME \
	-c "\copy ship FROM '$DATA_DIR/ship.csv' DELIMITER ',' CSV HEADER"

unset PGPASSWORD
