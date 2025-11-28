# Usamos Python 3.12 Slim (Versión ligera y moderna)
FROM python:3.12-slim

# Evita que Python genere archivos .pyc y fuerza la salida a la consola (bueno para logs)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalamos dependencias del sistema necesarias para PostgreSQL y netcat (para esperar a la DB)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copiamos primero los requirements para aprovechar la caché de Docker
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copiamos el resto del código
COPY . /app/

# Damos permisos de ejecución al script de entrada
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Exponemos el puerto (informativo)
EXPOSE 8000

# Ejecutamos el script de entrada
ENTRYPOINT ["/app/entrypoint.sh"]