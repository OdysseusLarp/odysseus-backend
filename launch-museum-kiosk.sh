#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if mount | grep -q overlay; then
  echo "Launching server + browser"
  # Set background image to launch screen
  xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitorLVDS-1/workspace0/last-image -s "$SCRIPT_DIR/museum/background.jpg"

  ./launch-browser.sh
else
  echo "Read-write mode in use, not starting. Use ./launch-server.sh and ./launch-browser.sh as necessary."
fi
