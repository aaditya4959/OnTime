import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";

dotenv.config();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default";
const WEBHOOK_URL = process.env.WEBHOOK_URL || "";
const WEBHOOK_PATH = `/bot/${BOT_TOKEN}`; // Unique path for the webhook
const fullWebhookUrl = `${WEBHOOK_URL}${WEBHOOK_PATH}`;

if (!BOT_TOKEN || !WEBHOOK_URL || !WEBHOOK_SECRET) {
    console.error("Configuration error: Ensure BOT_TOKEN, WEBHOOK_URL, and WEBHOOK_SECRET are set in your .env file.");
    process.exit(1);
}

// Initialize a new bot
const bot = new Telegraf(BOT_TOKEN);
// Defining the bot handlers
bot.start((context) => {
    context.reply("Welcome to OnTime Bot! Send your message");
});

bot.help((context) => {
    context.reply("I will help you stay on time!");
});

// Echor handler for all the text messages that are not commands
bot.on("text", (context) => {
    const userText = context.message.text;
    context.reply(`You said: ${userText}`);
})



// Express server setup for initiation of the connection
const app = express();

app.use(express.json());
app.use(cors());

//Telegraf webhook middleware
app.use(bot.webhookCallback(WEBHOOK_PATH, {
    secretToken: WEBHOOK_SECRET
}));

// sample route for checking the server status
app.get('/', (req, res) => {
    res.send(`Telegram Bot Server is running on port ${PORT}`);
});

app.listen(PORT, async () => {
    console.log(` Express server running on port ${PORT}`);
    
    // Call the Telegram API to set the webhook URL
    try {
        console.log(`Setting webhook to: ${fullWebhookUrl}`);
        
        await bot.telegram.setWebhook(fullWebhookUrl, {
            secret_token: WEBHOOK_SECRET,
        });

        console.log('✅ Webhook successfully set!');
    } catch (error: any) {
        console.error(' Error setting webhook:', error.message);
    }
});