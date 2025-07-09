#!/bin/bash

# Копируем SQL файл в контейнер
docker cp import_all.sql kes-site-mysql:/tmp/

# Импортируем данные
docker exec kes-site-mysql mysql -uroot -prootpassword kes-site --default-character-set=utf8 < /tmp/import_all.sql

echo "Data import completed successfully!" 