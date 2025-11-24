# Usamos Python 3.12 oficial (versión ligera)
FROM python:3.12-slim

# Evita que Python genere archivos .pyc y buffer de salida
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalar dependencias del sistema
# netcat: para el script de espera (nc)
# gcc, libpq-dev: para compilar psycopg2 (Postgres)
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
# Instalamos Daphne explícitamente por si no está en requirements
RUN pip install daphne gunicorn psycopg2-binary

# Copiar el código del proyecto
COPY . /app/

# Copiar y configurar el entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Ejecutar el entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Comando por defecto (Usamos Daphne para soportar WebSockets + HTTP)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "adtdcbba_backend.asgi:application"]