FROM node:10
COPY . teravia
WORKDIR teravia
RUN yarn install --production && \
    yarn build
CMD ["yarn", "start"]
