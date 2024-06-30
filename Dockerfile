# Base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build:shop-gql

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start:shop-gql"]