#!/bin/sh

# Si la base de datos es 'postgres', esperamos a que esté lista
if [ "$DATABASE" = "postgres" ]
then
    echo "Esperando a PostgreSQL..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL ha iniciado"
fi

# Ejecutar migraciones automáticamente al iniciar
echo "Ejecutando migraciones..."
python manage.py migrate

# Recopilar archivos estáticos
echo "Recopilando archivos estáticos..."
python manage.py collectstatic --no-input --clear

# Ejecutar el servidor (CORREGIDO: adtdcbba_backend en lugar de adtdcbba_project)
echo "Iniciando Servidor Daphne..."
exec daphne -b 0.0.0.0 -p 8000 adtdcbba_backend.asgi:application