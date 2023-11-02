FROM node:18-buster

COPY . /app

WORKDIR /app

RUN npm install

CMD ["npm", "run", "start:prod"]
