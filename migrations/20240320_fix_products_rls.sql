-- Включаем RLS для таблицы products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Создаем политику для чтения (все могут читать)
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT
    USING (true);

-- Создаем политику для вставки (только аутентифицированные пользователи)
CREATE POLICY "Enable insert for authenticated users only" ON products
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Создаем политику для обновления (только аутентифицированные пользователи)
CREATE POLICY "Enable update for authenticated users only" ON products
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Создаем политику для удаления (только аутентифицированные пользователи)
CREATE POLICY "Enable delete for authenticated users only" ON products
    FOR DELETE
    USING (auth.role() = 'authenticated'); 