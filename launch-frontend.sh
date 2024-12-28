#!/bin/bash -x
cd "$(dirname "$0")"

source "launch-helpers.sh"

cd ../odysseus-data-hub
npm start &
wait_for_frontend
