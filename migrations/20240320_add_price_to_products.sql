-- Добавляем поле price в таблицу products
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Обновляем существующие записи, устанавливая цену по умолчанию
UPDATE products SET price = 0 WHERE price IS NULL; 