FROM node:18-alpine

WORKDIR /APP
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3000
CMD ["npm", "start"]