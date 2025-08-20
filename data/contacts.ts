// data/contacts.ts

/**
 * Интерфейс для контактной информации заводе
 */
export interface ContactInfo {
  companyName: string;
  address: string;
  phone: string[];
  email: string[];
  workingHours: string;
}

/**
 * Контактная информация для использования по всему приложению
 */
export const contacts: ContactInfo = {
  companyName: "КотлоЭнергоСнаб",
  address: "г. Барнаул, ул. Бриллиантовая, 2Е",
  phone: ["+7 (3852) 226-338", "+7 (903) 948-72-73", "+7 (3852) 226-337"],
  email: ["kotloenergosnab1@mail.ru", "kotloenergosnab@mail.ru"],
  workingHours: "Пн–Пт: 8:00–17:00, Сб–Вс: выходной",
};
