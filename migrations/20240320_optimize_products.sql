-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_id ON products(id);

-- Create a partial index for non-null prices (if you frequently filter by price)
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price) WHERE price IS NOT NULL;

-- Create a composite index for category + price (if you frequently sort by price within categories)
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price);

-- Add a function to get products with pagination
CREATE OR REPLACE FUNCTION get_products_paginated(
    p_category_slug TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    price NUMERIC,
    image TEXT,
    category TEXT,
    category_slug TEXT,
    specs JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.category,
        p.category_slug,
        p.specs
    FROM products p
    WHERE 
        (p_category_slug IS NULL OR p.category_slug = p_category_slug)
    ORDER BY p.id
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Add a function to get product by ID with related data
CREATE OR REPLACE FUNCTION get_product_by_id(p_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    extended_description TEXT,
    price NUMERIC,
    image TEXT,
    category TEXT,
    category_slug TEXT,
    specs JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.extended_description,
        p.price,
        p.image,
        p.category,
        p.category_slug,
        p.specs
    FROM products p
    WHERE p.id = p_id;
END;
$$ LANGUAGE plpgsql; 