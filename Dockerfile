# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production dependencies for backend)
RUN npm install --omit=dev

# Copy the server directory
COPY server/ ./server/

# Expose the port Express will run on
EXPOSE 3001

# Start the server
CMD ["npm", "run", "start:server"]
