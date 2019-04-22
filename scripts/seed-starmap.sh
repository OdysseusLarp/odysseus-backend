#!/bin/bash

# Run this script to seed starmap data to a remote database from local CSV files

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DATA_DIR="$DIR/../db/data"

source "$DIR/../.env"

# Insert data from CSVs
psql -h $DB_HOST -U $DB_USER -d $DB_NAME \
	-c "\copy starmap_bg FROM '$DATA_DIR/starmap_bg.csv' DELIMITER ',' CSV HEADER" \
	-c "\copy starmap_object FROM '$DATA_DIR/starmap_object.csv' DELIMITER ',' CSV HEADER"

# SQL for generating CSVs from current data:
# COPY public.grid TO '/tmp/grid.csv' DELIMITER ',' CSV HEADER;
# COPY public.starmap_bg TO '/tmp/starmap_bg.csv' DELIMITER ',' CSV HEADER;
# COPY public.starmap_object TO '/tmp/starmap_object.csv' DELIMITER ',' CSV HEADER;
