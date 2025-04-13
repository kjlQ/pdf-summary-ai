FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
