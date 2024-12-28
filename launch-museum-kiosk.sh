#!/bin/bash -x
cd "$(dirname "$0")"

# FIXME: Make grep more specific as Docker also uses overlayfs
if mount | grep -q overlay; then
  # if true; then
  echo "Launching server + browser"
  # Set background image to launch screen
  xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitorLVDS-1/workspace0/last-image -s "$SCRIPT_DIR/museum/background.jpg"

  ./launch-server.sh
  ./launch-frontend.sh
  ./launch-browser.sh
else
  echo "Read-write mode in use, not starting. Use ./launch-server.sh and ./launch-browser.sh as necessary."
fi
