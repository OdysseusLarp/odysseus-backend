#!/bin/bash

# Fix volume permissions
sudo chown -R $USER: node_modules

# Install dependencies
npm install
npm run db:migrate
npm run db:seed
npm start