export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed"
    });
  }

  try {
    const { name, message } = req.body;

    const text = `
🔥 Новое сообщение с сайта

👤 Имя: ${name}

💬 Сообщение:
${message}
`;

    const telegramUrl =
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text
      })
    });

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      error: "Telegram send failed"
    });
  }
}
