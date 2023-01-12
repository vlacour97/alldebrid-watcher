FROM node:19-alpine

RUN npm install ts-node -g

COPY . /app

WORKDIR /app

RUN npm install
RUN mkdir /torrents /downloads

ENV PATH /app/node_modules/.bin:$PATH

CMD ["yarn", "start"]