FROM postgres:10

RUN apt-get update && apt-get install -y postgresql-10-postgis-2.4

ENV POSTGRES_PASSWORD=postgres

COPY ./data/starmap_bg.csv ./data/starmap_object.csv ./data/ship.csv /fixtures/
