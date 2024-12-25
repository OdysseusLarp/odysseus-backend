#!/bin/bash

if mount | grep -q overlay; then
  echo "Launching server + browser"
  ./launch-browser.sh
else
  echo "Read-write mode in use, not starting. Use ./launch-server.sh and ./launch-browser.sh as necessary."
fi
