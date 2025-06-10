// data/contacts.ts

/**
 * Интерфейс для контактной информации компании
 */
export interface ContactInfo {
  companyName: string;
  address: string;
  phone: string[];
  email: string;
  workingHours: string;
}

/**
 * Контактная информация для использования по всему приложению
 */
export const contacts: ContactInfo = {
  companyName: "КотлоЭнергоСнаб",
  address: "г. Барнаул, ул. Промышленная, 10",
  phone: ["+7 (3852) 123-456", "+7 (3852) 654-321"],
  email: "info@kotlenergosnab.ru",
  workingHours: "Пн–Пт: 9:00–18:00, Сб–Вс: выходной",
};
