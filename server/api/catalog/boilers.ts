export default defineEventHandler(async (event) => {
  // Здесь можно добавить загрузку данных из базы данных
  // Пока возвращаем тестовые данные
  return [
    {
      id: 1,
      name: "Котел КВ-Г-0,5",
      power: "0,5 МВт",
      fuel: "Газ",
      price: 450000,
      slug: "kotel-kv-g-05"
    },
    {
      id: 2,
      name: "Котел КВ-Г-1,0",
      power: "1,0 МВт",
      fuel: "Газ",
      price: 650000,
      slug: "kotel-kv-g-10"
    },
    {
      id: 3,
      name: "Котел КВ-Т-2,0",
      power: "2,0 МВт",
      fuel: "Твердое топливо",
      price: 850000,
      slug: "kotel-kv-t-20"
    }
  ]
}) 