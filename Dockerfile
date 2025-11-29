# Use the official Node.js image from the Docker Hub
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of your Node.js application
COPY . .

# Expose the port the app will run on (assuming 3000)
EXPOSE 9003

# Command to run your Node.js app
CMD ["npm", "start", "start-hyd"]
