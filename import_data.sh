#!/bin/bash

# Копируем файлы с данными в контейнер
docker cp "categories_rows.sql" kes-site-mysql:/tmp/
docker cp "products_rows (9).sql" kes-site-mysql:/tmp/products_rows.sql

# Импортируем данные в базу
docker exec kes-site-mysql /bin/bash -c 'mysql -uroot -prootpassword kes-site < /tmp/categories_rows.sql'
docker exec kes-site-mysql /bin/bash -c 'mysql -uroot -prootpassword kes-site < /tmp/products_rows.sql'

# Удаляем временные файлы из контейнера
docker exec kes-site-mysql /bin/bash -c 'rm /tmp/categories_rows.sql /tmp/products_rows.sql'

echo "Data import completed successfully!" 