#!/bin/bash

APP_DIRECTORY="/opt/backend"
APP_USER="odysseus"

sudo systemctl stop odysseus || true

sudo mkdir -p $APP_DIRECTORY
rm -r "$APP_DIRECTORY/*"
touch ${APP_DIRECTORY}/babel-cache.json
chown -R ${APP_USER}: ${APP_DIRECTORY}

rsync -azh --info=progress2 src db fixtures scripts node_modules \
	package.json package-lock.json knexfile.js aws appspec.yml $APP_DIRECTORY

read -r -d '' SERVICE << SERVICE
[Service]
WorkingDirectory=${APP_DIRECTORY}
Environment=BABEL_CACHE_PATH=${APP_DIRECTORY}/babel-cache.json
ExecStart=${APP_DIRECTORY}/node_modules/babel-cli/bin/babel-node.js src/index.js
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=odysseus-api
User=${APP_USER}
Group=${APP_USER}
EnvironmentFile=${APP_DIRECTORY}/.env
[Install]
WantedBy=multi-user.target
SERVICE

echo "$SERVICE" | sudo tee /etc/systemd/system/odysseus.service

cp /home/odysseus/.backend.env.prod $APP_DIRECTORY/.env

# Run database migrations
cd $APP_DIRECTORY && npm run db:migrate

sudo systemctl enable odysseus
sudo systemctl start odysseus
