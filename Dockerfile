# --- Build Angular ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration=production

# --- Serve con Nginx ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist/*/browser/ /usr/share/nginx/html/
# Config Nginx mínima para SPA
COPY ops/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
