FROM node:10-alpine
# Create app directory
WORKDIR /app
# Bundle app source
COPY . /app
# native dependencies extra tools
RUN apk add --no-cache make gcc g++ python
# node_modules
RUN npm install --production

ENV NODE_ENV=production
EXPOSE 3014
CMD ["npm", "start"]