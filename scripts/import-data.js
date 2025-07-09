import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const categories = [
  {
    id: "4d93743b-f375-42cc-bb16-11a626838d3c",
    name: "Топки",
    description:
      "Топки ТШПМ, ТЛПХ, ТЧЗМ.\nОни полностью механизируют ручной труд и обеспечивают автоматическую работу по заданному циклу в системе котла.",
    slug: "topki",
  },
  {
    id: "88efb582-b55c-4a02-9b41-5ccaca0f521e",
    name: "Водогрейные котлы",
    description:
      "Водогрейные котлы КВр, КВм, КВм Авто, KBa, мощностью до 4 МВт для отопления и горячего водоснабжения зданий и промышленных предприятий.",
    slug: "vodogreynye-kotly",
  },
];

const products = [
  {
    id: 77,
    name: "Котел КВр - 0,12",
    description:
      "Идеальный вариант для небольших производств, складов, гаражей и других объектов, где нужно простое и неприхотливое отопление.",
    extendedDescription:
      "# Котел стальной водогрейный КВр-0,12К\n\nПредназначен для теплоснабжения индивидуальных жилых домов и зданий коммунально – бытового назначения, оборудованных системами отопления с естественной циркуляцией воды при рабочем давлении 0,4 МПа (4,0 кгс/с м²)",
    price: 275000,
    image: "/api/uploads/LfKHLuRrBHjW.png",
    specs: [
      {
        id: 1,
        key: "Мощность МВт (Гкал/ч)",
        value: "0.12 (0.1)",
        show_in_filters: true,
        showKeySuggestions: false,
        showValueSuggestions: false,
      },
    ],
    category_id: "88efb582-b55c-4a02-9b41-5ccaca0f521e",
    additional_images: {},
    category_name: "Водогрейные котлы",
    category_slug: "vodogreynye-kotly",
    delivery_set: "Комплект поставки котла КВр-0,12К",
    connection_scheme: "/api/uploads/MJNhTSrKLCUk.png",
    additional_requirements: "Для эффективной и надежной работы котла КВр-0.12",
    required_products: {},
  },
  // Добавьте остальные продукты здесь
];

async function importData() {
  try {
    // Очищаем существующие данные
    await prisma.products.deleteMany();
    await prisma.categories.deleteMany();

    // Импортируем категории
    console.log("Импортируем категории...");
    await prisma.categories.createMany({
      data: categories,
    });

    // Импортируем продукты
    console.log("Импортируем продукты...");
    await prisma.products.createMany({
      data: products,
    });

    console.log("Импорт данных завершен успешно!");
  } catch (error) {
    console.error("Ошибка при импорте данных:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
