# Odysseus backend
Backend for multiple systems used in Odysseus larp.

## Setup
* Run `npm install` to install dependencies
* Copy `.env.dist` file to a file named `.env` and changle the default environmental variables if needed
* Run `npm start` to start the backend server
* Run `npm run db:start` to start a local dev database inside Docker. First time start will take time as the Docker image used contains PostGIS which is around 700mb.
* Run `npm run db:migrate` to run latest database migrations
* Run `npm run db:seed` to seed the database

## Tech
* Node 8+ should work, tested on Node 10
* PostgreSQL as database
* Docker can be used for running a local dev database

### Key libraries
* Express for web server
* Socket IO for websocket communications to update web clients easily
* Axios for http requests
* Knex for database migrations, seeds and running sql queries
* Bookshelf for ORM
* Ava for tests, Sinon and Nock for mocks, Nyc for reporting test coverage
* Signale for logging
