# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=5000
ENV MONGO_URL=mongodb://mongo:27017/feedback

EXPOSE 5000

CMD ["npm", "start"]