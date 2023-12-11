#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

#clear out log file so it doesn't get annoying
rm logs/celery.log

echo Celery Log File > logs/celery.log

# #delete all previously downloaded images since they 
# #are out of db now. 
# rm -r /usr/src/app/project/client/static/img
# mkdir /usr/src/app/project/client/static/img


exec "$@"
