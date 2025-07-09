#!/bin/bash

# Копируем файлы с данными в контейнер
docker cp "migrations/20240320_fix_categories_description.sql" kes-site-mysql:/tmp/

# Импортируем данные в базу
docker exec kes-site-mysql /bin/bash -c 'mysql -uroot -prootpassword kes-site < /tmp/20240320_fix_categories_description.sql'

# Удаляем временные файлы из контейнера
docker exec kes-site-mysql /bin/bash -c 'rm /tmp/20240320_fix_categories_description.sql'

echo "Data import completed successfully!" 