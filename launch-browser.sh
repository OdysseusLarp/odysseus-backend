#!/bin/bash

# URL to open in kiosk mode FIXME
URL="https://google.com"

# Chromium command with kiosk mode flags
CHROMIUM_CMD="chromium-browser --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble $URL"

# Function to start Chromium
start_chromium() {
    echo "Starting Chromium..."
    $CHROMIUM_CMD &
    CHROMIUM_PID=$! # Capture the PID of the process
    echo "Chromium started with PID $CHROMIUM_PID"
}

# Start Chromium initially
start_chromium

# Monitor Chromium
while true; do
    if ! kill -0 $CHROMIUM_PID 2>/dev/null; then
        echo "Chromium has exited. Restarting..."
        start_chromium
    fi
    sleep 2 # Check every 2 seconds
done
