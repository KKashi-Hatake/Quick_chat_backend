# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port your app runs on (adjust if needed)
EXPOSE 3000

# Define the command to run your app
CMD npx prisma migrate deploy && npm start
