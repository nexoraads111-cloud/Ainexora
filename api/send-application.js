export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { name, company, contact, message } = req.body;

    const text = `
🔥 НОВАЯ ЗАЯВКА С САЙТА

👤 Имя: ${name || "Не указано"}
🏢 Компания: ${company || "Не указано"}
📞 Контакт: ${contact || "Не указано"}

💬 Сообщение:
${message || "Не указано"}
`;

    const tg = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text
      })
    });

    const data = await tg.json();
    if (!data.ok) return res.status(500).json({ error: data });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
