FROM postgres:12

RUN apt-get update && apt-get install -y postgresql-12-postgis-3

ENV POSTGRES_PASSWORD=postgres

COPY ./data/starmap_bg.csv ./data/starmap_object.csv ./data/ship.csv /fixtures/
