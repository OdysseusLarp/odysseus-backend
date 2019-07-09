#!/bin/bash

set -e

ADMIN_UI=/opt/odysseus-admin-ui
SOCIAL_UI=/opt/odysseus-social-ui
JUMP_UI=/opt/odysseus-jump-ui
MISC_UI=/opt/odysseus-misc-ui
HANSCA=/opt/odysseus-hansca

sudo rm -rf \
        $ADMIN_UI \
        $SOCIAL_UI \
        $JUMP_UI \
        $MISC_UI \
        $HANSCA

sudo cp -r ./admin /opt/odysseus-admin-ui
sudo cp -r ./social /opt/odysseus-social-ui
sudo cp -r ./jump /opt/odysseus-jump-ui
sudo cp -r ./misc /opt/odysseus-misc-ui
sudo cp -r ./hansca /opt/odysseus-hansca

sudo chown -R root: \
        $ADMIN_UI \
        $SOCIAL_UI \
        $JUMP_UI \
        $MISC_UI \
        $HANSCA

echo Files copied, make sure that everything works
