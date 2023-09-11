# Odysseus backend
Backend for multiple systems used in Odysseus LARP.

## Local setup
* Run `npm install` to install dependencies
* Copy `.env.dist` file to a file named `.env` and changle the default environmental variables if needed
* Run `npm run db:start` to start a local dev database inside Docker. First time start will take time as the Docker image used contains PostGIS which is around 700mb.
* Run `npm run db:migrate` to run latest database migrations
* Run `npm run db:seed` to seed the database (check [odysseus-geoserver](https://github.com/OdysseusLarp/odysseus-geoserver) repository readme for seeding starmap tables)
* Run `npm start` to start the backend server
* Backend should now be available at [http://localhost:8888](http://localhost:8888)

### Backend in Docker
You can also run the backend in Docker if you do not want to. Update your .env file:
```
DB_HOST=odysseus-database
```

And then run `docker-compose -f docker-compose-dev.yml up`. The initial startup will fail because the database is empty. Run `docker exec -it odysseus-backend sh -c "npm run db:migrate && npm run db:seed"` to apply database migrations and seeds. Then restart the backend container `docker restart odysseus-backend`.

### Backend in .devcontainer (vscode)
You can also run the backend using vscode devcontainers. Update/copy your .env file as above.

Install Dev Containers extension for vscode.

* Open new window in vscode
* Open Folder... `odysseus-backend/db`
* VS Code will ask do you want to `Reopen in Container` --> Click it
* VS Code will then start up both containers and connect to both services (`database` and `backend`) and install npm packages, update the database migrations/seeds and start the services

## Tech
* Node v18.14.0
* PostgreSQL 12 + PostGIS
* Docker can be used for running a local dev database

### Key libraries
* Express
* Socket.IO
* Knex + Bookshelf.js

## REST APIs
REST API routes are documented in Swagger UI accessible via `/api-docs` route.

### Empty Epsilon integration
Backend will poll data from EmptyEpsilon and store it in `ship/ee` data store. Metadata related to the integration state (is connection active, possible error messages) are stored in `ship/ee_metadata` data store. Target EmptyEpsilon server and polling frequency needs to be set up in the `.env` file:

```
EMPTY_EPSILON_HOST=localhost
EMPTY_EPSILON_PORT=8080
EMPTY_EPSILON_UPDATE_INTERVAL_MS=1000
```

If connection details are not provided in the config, the backend will start a very simple emulated server. It keeps healths/heats/weapon counts in memory (initial values are read from `fixtures/emptyepsilon.js`) and they can be read and updated by using the API.

EmptyEpsilon state can be mutated by sending single commands as PUT requests to `/state` route. Check `/state` route and `EmptyEpsilonCommand` model in Swagger docs for more. Current state in `ship/ee` data store can be pushed to EmptyEpsilon by making a POST request to `/state/full-push`.

EmptyEpsilon integration can be paused by setting `ee_sync_enabled` to `false` in `ship/metadata` data store, and enabled again by setting the value to `true`.

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

## DMX
The backend sends DMX signals to trigger lights and sound during certain events. Make sure that you have `DMX_DEVICE_PATH` and `DMX_DRIVER` set correctly in `.env` if you actually have a DMX device that you want to use. Otherwise you can leave them blank.

## Production setup
* Copy `.env.dist` to `.backend.env.prod` and set the correct settings
* Check that `docker-compose.yml` has the correct `POSTGRES_PASSWORD` env
* Check that `docker-compose.yml` has the correct volume mount path for the host computer, since PostgreSQL data will be persisted there
* Check that `docker-compose.yml` has the correct DMX device path
* Run `docker-compose build` to build the database and backend images
* Run `docker-compose up -d` to start the database and bakend containers
