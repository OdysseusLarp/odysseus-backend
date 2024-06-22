#!/usr/bin/env bash

set -euo pipefail

input="files.csv"

# Function to generate a short hash from an ID
generate_hash() {
  echo -n "$1" | sha1sum | cut -c1-8
}

mkdir -p ./processed
rm -f ./processed/*.pdf

while IFS=',' read -r id file; do
  # Skip the header line
  if [ "$id" != "id" ]; then
    # Remove leading ./ from the filename if present
    filename="${file#./}"
    hash=$(generate_hash "$id")
    # hash="$id"
    cp "$filename" "./processed/${hash}.pdf"
  fi
done < "$input"

