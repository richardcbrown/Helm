FROM node:10

WORKDIR /code

RUN npm install -g nodemon@1.19.1

COPY package.json /code/package.json
RUN npm install
RUN mv /code/node_modules /node_modules

COPY . /code

CMD ["npm", "start"]