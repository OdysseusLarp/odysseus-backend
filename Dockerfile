FROM node:10

COPY . /opt/app
WORKDIR /opt/app
RUN npm install

CMD npm run start:prod
