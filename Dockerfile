FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY halo-system/backend/package*.json ./
RUN npm install --production

# Bundle app source
COPY halo-system/backend ./

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
