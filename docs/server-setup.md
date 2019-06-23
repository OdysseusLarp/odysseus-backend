# Deployments

We are using Ubuntu 19.04 as our production server.

Software that should be installed:
* Node 10.16.0 with npm 6.9.0
* Nginx
* Docker
* Docker Compose
* Git

You should have a user `odysseus`.

Nginx configuration can be found in `/etc/nginx/sites-available/default`.

## Backend
Backend and database run in Docker containers. Both can be started in the same network using Docker Compose. Health checks are enabled for both and containers should restart if they become unhealthy.

* Make sure that you have pulled the latest changes to `/home/odysseus/git/odysseus-backend`
* Build the docker containers with `docker-compose build`
* Run the compose file with `docker-compose up -d` which will only update the containers that have changed (e.g. if changes have been made to the backend, only backend will be restarted, not the database)

## Geoserver
Geoserver runs in a Docker container. There should be no need to touch it during the game. The container has health check enabled and should restart if it becomes unhealthy.

* Make sure that you have pulled the latest changes to `/home/odysseus/odysseus-geoserver`
* Build the container with `docker build -t odysseus-geoserver .`
* Create the container with `./run-geoserver.sh`

## OpenMCT
OpenMCT runs as a systemd service called `odysseus-mct`. You can check the status with `sudo systemctl status odysseus-mct`. OpenMCT has no health checks enabled, if it becomes unresponsive restart it with `sudo systemctl restart odysseus-mct`. If files need to be updated:

* Make sure that you have pulled the latest changes to `/home/odysseus/odysseus-mct`
* Run the deploy script `bash /home/odysseus/odysseus-mct/deploy.sh`
* If for some reason you needed to recreate the systemd service, it has been created similarly as in `odysseus-mct/scripts/deploy.sh`

## Frontends
Make sure that the latest versions of ALL frontends are located in these paths:

```bash
/home/odysseus/social/dist/odysseus-social-hub/index.html
/home/odysseus/jump/dist/odysseus-jump-ui/index.html
/home/odysseus/misc/dist/index.html
/home/odysseus/admin/dist/index.html
```

This will deploy all frontends to correct paths and set the correct permissions:

```bash
bash /home/odysseus/deploy-fronts.sh
```

After deployment, the files should be located in these paths:

```bash
/opt/odysseus-jump-ui/dist/odysseus-jump-ui/index.html
/opt/odysseus-social-ui/dist/odysseus-social-hub/index.html
/opt/odysseus-misc-ui/dist/index.html
/opt/odysseus-admin-ui/dist/index.html
```

## Monitoring and logging
* Run `docker-compose up -d` in `/home/odysseus/git/dockprom` to start the grafana/prometheus stack.
* Dozzle (provides UI for docker logs) can be started with `docker start log-dozzle` or created with `docker run --name log-dozzle -d -v /var/run/docker.sock:/var/run/docker.sock -p 1337:8080 amir20/dozzle`

