FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

RUN --mount=type=secret,id=dotenv,target=./.env npm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]