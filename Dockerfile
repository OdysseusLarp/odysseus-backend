FROM keymetrics/pm2:10-jessie

COPY . /app

WORKDIR /app

RUN npm install && mv .backend.env.prod .env

CMD ["pm2-runtime", "start", "pm2.json"]
