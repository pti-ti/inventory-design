# Etapa de construcción
FROM node:20-alpine AS build
WORKDIR /app
COPY . .

# Inyectamos la variable como .env para que VITE la lea 
ARG VITE_API_URL
RUN echo "VITE_API_URL=$VITE_API_URL" > .env

RUN npm install
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
