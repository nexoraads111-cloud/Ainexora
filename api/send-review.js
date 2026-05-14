import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed"
    });
  }

  try {
    const { name, title, text, rating } = req.body;

    // СОХРАНЯЕМ ОТЗЫВ В FIREBASE
    const reviewRef = await db.collection("reviews").add({
  name,
  title,
  text,
  rating: Number(rating),
  approved: false,
  timestamp: admin.firestore.FieldValue.serverTimestamp()
});

    const reviewId = reviewRef.id;

    const message = `
⭐ НОВЫЙ ОТЗЫВ

👤 Имя: ${name}

⭐ Оценка: ${rating}

📝 Заголовок:
${title}

💬 Отзыв:
${text}
`;

    // ОТПРАВКА В TELEGRAM С КНОПКАМИ
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Принять",
                  callback_data: `approve_${reviewId}`
                },
                {
                  text: "❌ Отклонить",
                  callback_data: `reject_${reviewId}`
                }
              ]
            ]
          }
        })
      }
    );

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
