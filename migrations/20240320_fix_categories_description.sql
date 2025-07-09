-- Изменяем тип поля description в таблице categories на TEXT
ALTER TABLE categories MODIFY COLUMN description TEXT;

-- Очищаем существующие данные (если есть)
DELETE FROM products;
DELETE FROM categories;

-- Импортируем категории
INSERT INTO categories (id, name, description, slug) 
VALUES 
('4d93743b-f375-42cc-bb16-11a626838d3c', 'Топки', 'Топки ТШПМ, ТЛПХ, ТЧЗМ.
Они полностью механизируют ручной труд и обеспечивают автоматическую работу по заданному циклу в системе котла.', 'topki'),
('88efb582-b55c-4a02-9b41-5ccaca0f521e', 'Водогрейные котлы', 'Водогрейные котлы КВр, КВм, КВм Авто, KBa, мощностью до 4 МВт для отопления и горячего водоснабжения зданий и промышленных предприятий.', 'vodogreynye-kotly');

-- Импортируем продукты (копируем содержимое из products_rows.sql)
INSERT INTO products (id, name, description, extendedDescription, price, image, specs, category_id, additional_images, category_name, category_slug, delivery_set, connection_scheme, additional_requirements, required_products) 
VALUES 
('77', 'Котел КВр - 0,12', 'Идеальный вариант для небольших производств, складов, гаражей и других объектов, где нужно простое и неприхотливое отопление.', '# Котел стальной водогрейный КВр-0,12К

Предназначен для теплоснабжения индивидуальных жилых домов и зданий коммунально – бытового назначения, оборудованных системами отопления с естественной циркуляцией воды при рабочем давлении 0,4 МПа (4,0 кгс/с м²)', '275000', '/api/uploads/LfKHLuRrBHjW.png', '[{"id": 1, "key": "Мощность МВт (Гкал/ч)", "value": "0.12 (0.1)", "show_in_filters": true, "showKeySuggestions": false, "showValueSuggestions": false}]', '88efb582-b55c-4a02-9b41-5ccaca0f521e', '{}', 'Водогрейные котлы', 'vodogreynye-kotly', 'Комплект поставки котла КВр-0,12К', '/api/uploads/MJNhTSrKLCUk.png', 'Для эффективной и надежной работы котла КВр-0.12', '{}');

-- Добавьте остальные записи из products_rows.sql сюда 