FROM node

WORKDIR /app

COPY . .
# COPY . /app 

RUN yarn

EXPOSE 3000

CMD ["node", "server"]









# "cross-env NODE_ENV=production node ./server.js"



