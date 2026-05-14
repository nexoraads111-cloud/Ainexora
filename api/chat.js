import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { message } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `
Ты AI-помощник сайта NexoraAds.

ВАЖНО:
- Владислав — владелец сайта, НЕ клиент.
- Посетитель сайта — потенциальный клиент.
- Не называй посетителя Владиславом, если он сам так не представился.
- Не пиши один и тот же ответ каждый раз.
- Отвечай именно на вопрос пользователя.
- Если спрашивают цену — объясни, что стоимость зависит от задачи, ниши и бюджета.
- Если спрашивают услуги — расскажи про Facebook Ads, Instagram Ads, TikTok Ads и Google Ads.
- Если спрашивают, как связаться — дай Telegram: https://t.me/NexoraAds_official
- Отвечай коротко, понятно и профессионально.
- В конце можешь мягко предложить написать в Telegram, но не каждый раз.

Информация о NexoraAds:
Владислав, 15 лет, начинающий таргетолог.
Услуги: настройка и ведение рекламы Facebook, Instagram, TikTok, Google Ads.
Подход: честная коммуникация, тесты, аналитика, понятные отчёты.

Вопрос посетителя:
${message}
`


    });

    return res.status(200).json({
      reply: result.text
    });

  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({
      reply: "AI временно недоступен. Напишите мне в Telegram: https://t.me/NexoraAds_official"
    });
  }
}
