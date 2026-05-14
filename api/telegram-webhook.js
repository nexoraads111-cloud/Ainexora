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
  if (req.method === "GET") {
    return res.status(200).json({ ok: true });
  }

  try {
    const update = req.body;

    if (!update.callback_query) {
      return res.status(200).json({ ok: true });
    }

    const callback = update.callback_query;
    const data = callback.data;
    const callbackId = callback.id;

    const [action, reviewId] = data.split("_");

    if (!reviewId) {
      return res.status(200).json({ ok: true });
    }

    if (action === "approve") {
      await db.collection("reviews").doc(reviewId).update({
        approved: true
      });
    }

    if (action === "reject") {
      await db.collection("reviews").doc(reviewId).delete();
    }

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackId,
          text: action === "approve" ? "Отзыв принят ✅" : "Отзыв отклонён ❌"
        })
      }
    );

    return res.status(200).json({ ok: true });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
