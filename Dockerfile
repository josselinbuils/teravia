FROM node:8
COPY . teravia
WORKDIR teravia
RUN npm install --production && \
    npm run build
CMD ["npm", "start"]
