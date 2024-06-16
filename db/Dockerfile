FROM postgres:12

RUN apt-get update && apt-get install -y postgresql-12-postgis-3

ENV POSTGRES_PASSWORD=postgres

# Configure Europe/Helsinki timezone
RUN ln -fs /usr/share/zoneinfo/Europe/Helsinki /etc/localtime && dpkg-reconfigure -f noninteractive tzdata

COPY ./data/starmap_bg.csv ./data/starmap_object.csv ./data/ship.csv /fixtures/
