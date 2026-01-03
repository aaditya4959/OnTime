import { bot } from "../../lib/bot.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const secret = req.headers["x-telegram-bot-api-secret-token"];

    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).send("Unauthorized");
    }

    res.status(200).json({ ok: true }); // RESPOND FAST

    await bot.handleUpdate(req.body);
  } catch (err) {
    console.error("Webhook error:", err);
  }
}

export const config = {
  api: {
    bodyParser: true
  }
};
