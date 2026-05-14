import { getAdminDb, FieldValue } from "./firebase-admin.js";

async function telegram(method, payload) {
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  return response.json();
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "telegram-webhook endpoint работает. Telegram будет отправлять сюда POST callback_query."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const update = req.body;

    if (!update.callback_query) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const callback = update.callback_query;
    const data = callback.data || "";
    const [action, reviewId] = data.split(":");

    if (!reviewId || !["approve", "reject"].includes(action)) {
      await telegram("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Неизвестная команда"
      });

      return res.status(200).json({ ok: true });
    }

    const db = getAdminDb();
    const reviewRef = db.collection("reviews").doc(reviewId);

    if (action === "approve") {
      await reviewRef.update({
        approved: true,
        status: "approved",
        moderatedAt: FieldValue.serverTimestamp()
      });

      await telegram("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Отзыв опубликован ✅",
        show_alert: false
      });

      await telegram("editMessageReplyMarkup", {
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        reply_markup: { inline_keyboard: [] }
      });

      await telegram("sendMessage", {
        chat_id: callback.message.chat.id,
        text: `✅ Отзыв опубликован на сайте\nID: ${reviewId}`
      });
    }

    if (action === "reject") {
      await reviewRef.update({
        approved: false,
        status: "rejected",
        moderatedAt: FieldValue.serverTimestamp()
      });

      await telegram("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Отзыв отклонён ❌",
        show_alert: false
      });

      await telegram("editMessageReplyMarkup", {
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        reply_markup: { inline_keyboard: [] }
      });

      await telegram("sendMessage", {
        chat_id: callback.message.chat.id,
        text: `❌ Отзыв отклонён\nID: ${reviewId}`
      });
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("telegram-webhook error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
