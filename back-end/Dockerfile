FROM node:18

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install npm packages with increased timeout and verbose logging
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm install --verbose

COPY . .
CMD ["npm", "run", "dev"]
