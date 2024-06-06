#!/bin/bash

# Fix volume permissions
sudo chown -R $USER: node_modules

# Add git config
git config --global --add safe.directory /workspace

# Install dependencies
npm install
npm install -g nodemon
npm run db:migrate
npm run db:seed
npm start