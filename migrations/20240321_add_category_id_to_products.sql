-- Добавляем поле category_id в таблицу products
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Создаем индекс для ускорения поиска по category_id
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Обновляем существующие записи, связывая их с категориями по slug
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category_slug = c.slug; 