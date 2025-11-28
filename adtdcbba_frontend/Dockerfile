# --- ETAPA 1: Construcción (Build) ---
FROM node:20-alpine as build

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el código fuente
COPY . .

# Construimos la aplicación para producción
RUN npm run build

# --- ETAPA 2: Servidor de Producción (Nginx) ---
FROM nginx:alpine

# Copiamos los archivos construidos desde la etapa anterior a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración personalizada de Nginx (La crearemos en el siguiente paso)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]