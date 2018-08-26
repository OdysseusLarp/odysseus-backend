# Odysseus backend

Backend for multiple systems used in Odysseus larp.

## Setup
* Run `npm install` to install dependencies
* Copy `.env.dist` file to a file named `.env` and setup the environmental variables correctly
* Run `npm start` to start the server

## Tech
* Node 8+ should work, tested on Node 10
* PostgreSQL as database

### Key libraries
* Express for web server
* Socket IO for websocket communications to update web clients easily
* Axios for http requests
* Knex + Bookshelf for database communication
* Ava for tests, Sinon and Nock for mocks, Nyc for reporting test coverage
* Signale for logging
