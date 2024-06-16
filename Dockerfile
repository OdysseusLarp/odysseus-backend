FROM node:18-buster

COPY . /app

WORKDIR /app

RUN npm install

# Configure Europe/Helsinki timezone
RUN ln -fs /usr/share/zoneinfo/Europe/Helsinki /etc/localtime && dpkg-reconfigure -f noninteractive tzdata

CMD ["npm", "run", "start:prod"]
