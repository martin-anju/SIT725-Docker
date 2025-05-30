# 1. Base image: Node LTS on Alpine Linux
FROM node:18-alpine

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy all local files into the container
COPY . .

# 5. Expose the app’s port (match your app)
ENV PORT=3002
EXPOSE 3002

# 6. Start the server
CMD ["npm", "start"]
