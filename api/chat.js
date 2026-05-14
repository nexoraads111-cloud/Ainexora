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
Владислав, 15 лет, начинающий таргетолог.
Услуги: Facebook Ads, Instagram Ads, TikTok Ads, Google Ads.
Отвечай коротко, дружелюбно и профессионально.
Помогай клиенту написать в Telegram: https://t.me/NexoraAds_official

Вопрос клиента:
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
