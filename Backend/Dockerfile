FROM node:20

RUN apt-get update && apt-get install -y curl

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]