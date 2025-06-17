-- Проверяем и добавляем столбцы, если их нет
DO $$
BEGIN
    -- Проверяем существование столбца category_name
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'category_name'
    ) THEN
        ALTER TABLE products ADD COLUMN category_name text REFERENCES categories(name);
    END IF;

    -- Проверяем существование столбца category_slug
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'category_slug'
    ) THEN
        ALTER TABLE products ADD COLUMN category_slug text REFERENCES categories(slug);
    END IF;
END
$$;

-- Обновляем существующие данные
UPDATE products
SET 
    category_name = categories.name,
    category_slug = categories.slug
FROM categories
WHERE products.category_id = categories.id
AND (products.category_name IS NULL OR products.category_slug IS NULL);

-- Проверяем существование индексов перед созданием
DO $$
BEGIN
    -- Проверяем индекс для category_name
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'products'
        AND indexname = 'idx_products_category_name'
    ) THEN
        CREATE INDEX idx_products_category_name ON products(category_name);
    END IF;

    -- Проверяем индекс для category_slug
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'products'
        AND indexname = 'idx_products_category_slug'
    ) THEN
        CREATE INDEX idx_products_category_slug ON products(category_slug);
    END IF;
END
$$;

-- Создаем или заменяем функцию триггера
CREATE OR REPLACE FUNCTION update_product_category_fields()
RETURNS TRIGGER AS $$
BEGIN
    SELECT name, slug INTO NEW.category_name, NEW.category_slug
    FROM categories
    WHERE id = NEW.category_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Проверяем существование триггера перед созданием
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_product_category_fields_trigger'
    ) THEN
        CREATE TRIGGER update_product_category_fields_trigger
        BEFORE INSERT OR UPDATE OF category_id ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_product_category_fields();
    END IF;
END
$$; 