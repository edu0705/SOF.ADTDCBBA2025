# --- ETAPA 1: Construcción (Node.js) ---
FROM node:20-alpine as build

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copiamos el código fuente
COPY . ./

# Argumentos de construcción (Para que Vite sepa la URL del backend)
# En Docker interno, Nginx manejará el proxy, así que la API es relativa
ENV VITE_API_URL=/api
ENV VITE_WS_URL=/ws

# Compilamos la aplicación (genera carpeta /dist)
RUN npm run build

# --- ETAPA 2: Servidor Producción (Nginx) ---
FROM nginx:alpine

# Copiamos los archivos compilados de la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]