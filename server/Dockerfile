FROM node:20-alpine

# Install Docker CLI for container management
RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
