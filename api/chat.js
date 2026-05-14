import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed"
    });
  }

  try {
    const { message } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const prompt = `
Ты AI помощник сайта NexoraAds.

Информация:
- Владислав
- 15 лет
- таргетолог
- Facebook Ads
- Instagram Ads
- TikTok Ads
- Google Ads
- отвечай коротко и профессионально
- помогай клиенту перейти в Telegram

Telegram:
https://t.me/NexoraAds_official

Сообщение клиента:
${message}
`;

    const result = await model.generateContent(prompt);

    const reply = result.response.text();

    return res.status(200).json({
      reply
    });

  } catch (error) {
    return res.status(500).json({
      reply: "AI временно недоступен"
    });
  }
}