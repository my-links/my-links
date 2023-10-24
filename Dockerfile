FROM node:18-alpine3.17

WORKDIR /app
COPY ./ /app

RUN npm install
RUN npm run build

EXPOSE 3000

CMD npx prisma migrate deploy && npm run start 
