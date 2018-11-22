#!/bin/bash

# Assumes that node, npm and awscli are installed and that
# system user and group "odysseus" has been created

APP_DIRECTORY="/opt/app"
APP_USER="odysseus"
BUCKET="odysseus-larp-dev"

sudo mkdir -p $APP_DIRECTORY
touch ${APP_DIRECTORY}/babel-cache.json
chown -R ${APP_USER}: ${INSTALL_DIR}

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

# Get latest env file from S3
aws s3 cp s3://${BUCKET}/.env.dev ${APP_DIRECTORY}/.env

# Run database migrations
cd $APP_DIRECTORY && npm run db:migrate

sudo systemctl enable odysseus
