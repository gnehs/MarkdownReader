FROM mhart/alpine-node:latest

# Create app directory
RUN mkdir -p /app
WORKDIR /app
# Bundle app source
COPY . /app
# Install app dependencies
COPY package.json /app/
RUN npm install


EXPOSE 3014
CMD ["npm", "start"]