# Odysseus backend
Backend for multiple systems used in Odysseus LARP.

## Local setup
* Run `npm install` to install dependencies
* Copy `.env.dist` file to a file named `.env` and changle the default environmental variables if needed
* Run `npm run db:start` to start a local dev database inside Docker. First time start will take time as the Docker image used contains PostGIS which is around 700mb.
* Run `npm run db:migrate` to run latest database migrations
* Run `npm run db:seed` to seed the database (check [odysseus-geoserver](https://github.com/OdysseusLarp/odysseus-geoserver) repository readme for seeding starmap tables)
* Run `npm start` to start the backend server

## Tech
* Node (version 10 and up should work)
* PostgreSQL 10 + PostGIS
* Docker can be used for running a local dev database

### Key libraries
* Express
* Socket.IO
* Knex + Bookshelf.js

## REST APIs
REST API routes are documented in Swagger UI accessible via `/docs` route.

## Socket.io APIs

### Generic data store

Connect to namespace `/data` with optional query parameter `data` describing what data blobs are listened to (by default all).  For example:

    http://server.name:8888/data  -  all changes
    http://server.name:8888/data?data=/data  -  all changes
    http://server.name:8888/data?data=/data/mytype  -  all changes within mytype
    http://server.name:8888/data?data=/data/mytype/myid  -  only changes of single data blob

Events fired by server are:

    'dataUpdate', type, id, {...new content...}
    'dataDelete', type, id

