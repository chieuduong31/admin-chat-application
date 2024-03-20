# build stage
FROM node:18.17.1-alpine as build-stage
WORKDIR /app
COPY ./package.json .
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:1.16-alpine as production-stage
ENV TZ Asia/Tokyo
RUN apk add --update --no-cache --virtual=.build-dependencies \
    autoconf \
    gcc \
    g++ \
    make \
    tzdata
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
WORKDIR /usr/share/nginx/html

