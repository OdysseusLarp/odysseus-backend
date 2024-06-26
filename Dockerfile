FROM node:18-buster

# Utilize Docker cache for dependencies to speed up builds
RUN mkdir -p /node-deps && mkdir -p /app
COPY package*.json /node-deps/
RUN cd /node-deps && npm install
RUN ln -s /node-deps/node_modules /app/node_modules

# Copy the rest of the application
WORKDIR /app
COPY . /app

# Configure Europe/Helsinki timezone
RUN ln -fs /usr/share/zoneinfo/Europe/Helsinki /etc/localtime && dpkg-reconfigure -f noninteractive tzdata

CMD ["npm", "run", "start:prod"]
