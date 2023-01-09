# build stage
FROM --platform=linux/arm64 node:alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# production stage
FROM --platform=linux/arm64 nginx:stable-alpine as production-stage

# Provide a custom nginx.conf, tweaked for Docker use
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site.conf /etc/nginx/nginx.conf

COPY --from=build-stage /app/dist /usr/share/nginx/html
RUN apk update && apk upgrade

RUN adduser --disabled-password appuser && chown -R appuser /usr/share/nginx/html
RUN chown -R appuser /var/cache/nginx && \
       chown -R appuser /var/log/nginx && \
       chown -R appuser /etc/nginx/conf.d
RUN chown -R appuser /var/run/

USER appuser
WORKDIR /usr/share/nginx/html

EXPOSE 8080
ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]