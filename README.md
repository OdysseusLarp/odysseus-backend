# Odysseus backend
Backend for multiple systems used in Odysseus LARP.

## Local setup
* Run `npm install` to install dependencies
* Copy `.env.dist` file to a file named `.env` and changle the default environmental variables if needed
* Run `npm run db:start` to start a local dev database inside Docker. First time start will take time as the Docker image used contains PostGIS which is around 700mb.
* Run `npm run db:migrate` to run latest database migrations
* Run `npm run db:seed` to seed the database
* Run `npm start` to start the backend server

## Tech
* Node (version 8 and up should work)
* PostgreSQL 10 + PostGIS
* Docker can be used for running a local dev database

### Key libraries
* Express
* Socket.IO
* Knex + Bookshelf.js
