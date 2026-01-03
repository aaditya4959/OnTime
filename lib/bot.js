import { Telegraf } from "telegraf";
import dotenv from "deotenv";
dotenv.config();

export const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on("text", async (ctx) => {
  await ctx.reply("OnTime bot is live 🚀");
});
