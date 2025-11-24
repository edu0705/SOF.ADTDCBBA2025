#!/bin/sh

# Si la base de datos es Postgres, esperamos a que esté lista
if [ "$DATABASE" = "postgres" ]
then
    echo "Esperando a PostgreSQL..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL iniciado"
fi

# Ejecutar migraciones automáticamente
echo "Aplicando migraciones..."
python manage.py migrate

# Recopilar archivos estáticos (CSS, JS de admin)
echo "Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

# Ejecutar el servidor
exec "$@"