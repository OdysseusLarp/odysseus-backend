FROM keymetrics/pm2:14-stretch

COPY . /app

WORKDIR /app

RUN npm install

CMD ["pm2-runtime", "start", "pm2.json"]
