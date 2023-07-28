FROM node:18-buster

COPY . /app

WORKDIR /app

# Python 3 is required by serialport package, dependency of dmx package
# RUN apk add --no-cache python3 py3-pip make gcc g++ libc-dev

RUN npm install

CMD ["npm", "run", "start:prod"]
