import { Telegraf } from "telegraf";


export const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on("text", async (ctx) => {
  await ctx.reply("OnTime bot is live 🚀");
});
