export const useTelegramNotify = () => {
  const { $device } = useNuxtApp();

  const sendNotification = async (phone?: string) => {
    try {
      const route = useRoute();
      const userAgent = navigator.userAgent;

      // Получаем IP адрес (если доступно)
      let ip = "Не определен";
      try {
        const ipResponse = await $fetch("https://api.ipify.org?format=json");
        ip = ipResponse.ip;
      } catch (e) {
        console.log("Не удалось получить IP");
      }

      const notificationData = {
        phone: phone || "Не указан",
        userAgent: userAgent,
        ip: ip,
        page: route.path,
        timestamp: new Date().toISOString(),
      };

      // Отправляем уведомление
      const response = await $fetch("/api/telegram-notify", {
        method: "POST",
        body: notificationData,
      });

      if (response.success) {
        console.log("Уведомление отправлено в Telegram");
      } else {
        console.error("Ошибка отправки уведомления:", response.error);
      }
    } catch (error) {
      console.error("Ошибка отправки уведомления в Telegram:", error);
    }
  };

  const notifyOnVisit = () => {
    // Отправляем уведомление при первом посещении
    sendNotification();
  };

  const notifyOnContact = (phone: string) => {
    // Отправляем уведомление при заполнении контактной формы
    sendNotification(phone);
  };

  return {
    sendNotification,
    notifyOnVisit,
    notifyOnContact,
  };
};
