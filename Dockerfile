FROM node:20-alpine AS builder

ARG VITE_KEYCLOAK_URL=""
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
