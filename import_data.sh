#!/bin/bash

# Очищаем таблицы перед импортом
docker exec kes-site-mysql /bin/bash -c 'mysql -uroot -prootpassword kes-site -e "DELETE FROM products; DELETE FROM categories;"'

# Копируем файлы с данными в контейнер
docker cp "categories_rows.sql" kes-site-mysql:/tmp/
docker cp "products_rows (9).sql" kes-site-mysql:/tmp/products_rows.sql

# Устанавливаем кодировку и импортируем данные
docker exec kes-site-mysql /bin/bash -c 'mysql -uroot -prootpassword kes-site --default-character-set=utf8 < /tmp/categories_rows.sql'
docker exec kes-site-mysql /bin/bash -c 'mysql -uroot -prootpassword kes-site --default-character-set=utf8 < /tmp/products_rows.sql'

# Удаляем временные файлы
docker exec kes-site-mysql rm /tmp/categories_rows.sql /tmp/products_rows.sql

echo "Data import completed successfully!" 