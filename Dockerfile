# Etapa de construcción
FROM node:20-alpine AS build
WORKDIR /app
COPY . .

# PASO CLAVE: definir ARG y ENV para que Vite la use al construir
ARG REACT_APP_API_BASE_URL
ENV VITE_API_BASE_URL=$REACT_APP_API_BASE_URL

RUN npm install
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

