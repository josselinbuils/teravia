FROM node:10
COPY . teravia
WORKDIR teravia
RUN yarn install --production --frozen-lockfile && \
    yarn build
CMD ["yarn", "start"]
