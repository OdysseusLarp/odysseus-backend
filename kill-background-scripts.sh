#!/bin/bash -x
cd "$(dirname "$0")"

source "launch-helpers.sh"

kill_script "launch-server.sh"
kill_script "launch-browser.sh"
kill_script "launch-museum-kiosk.sh"
