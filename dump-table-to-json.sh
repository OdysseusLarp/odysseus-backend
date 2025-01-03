#!/bin/bash -e

if [ -z "$1" ]; then
	echo "Usage: $0 <table_name>"
	exit 1
fi

# Load env variables from .env
source .env

TABLE_NAME="$1"
OUTPUT_FILE="museum/data/$TABLE_NAME.json"

# Create the dump using psql
PGPASSWORD="$DB_PASSWORD" psql \
	-h "$DB_HOST" \
	-p "$DB_PORT" \
	-U "$DB_USER" \
	-d "$DB_NAME" \
	-t -A \
	-c "SELECT json_agg($TABLE_NAME) FROM $TABLE_NAME" \
	>"$OUTPUT_FILE"

echo "Dumped table '$TABLE_NAME' to '$OUTPUT_FILE'."
