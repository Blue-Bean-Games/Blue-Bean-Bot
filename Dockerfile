FROM node:16-alpine
WORKDIR /usr/app
COPY . .
RUN npm i
CMD [ "node", "main.js" ]