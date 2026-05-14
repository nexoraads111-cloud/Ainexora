export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const data = req.body;

    const text = `
🔥 Новое сообщение с сайта NexoraAds

👤 Имя: ${data.name || "Не указано"}
🏢 Компания: ${data.company || "Не указано"}
📞 Контакт: ${data.contact || data.phone || "Не указано"}
⭐ Оценка: ${data.rating || "Не указано"}
📝 Заголовок: ${data.title || "Не указано"}

💬 Сообщение:
${data.message || data.text || "Нет сообщения"}
`;

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const tgResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text
      })
    });

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      return res.status(500).json({
        error: "Telegram error",
        details: tgData
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({
      error: "Telegram send failed",
      details: error.message
    });
  }
}
