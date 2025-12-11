import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { getJSONFromText } from "./utils/apiCall.js";
import { responseParser } from "./utils/responseParser.js";

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
    
    const customPrompt = `
        You are an AI assistant that extracts structured event information from natural-language text messages.  
        Your task is to analyze the user's message and convert it into the following JSON format:

        {
        "intent": "",
        "title": "",
        "participants": [],
        "date": "",
        "time": "",
        "reminder": ""
        }

        Follow these rules strictly:

        1. Determine the user's intent:
        - "create_event" → if the user wants to schedule, set, plan, book, or arrange something.
        - "unknown" → if the message does not indicate any event creation.

        2. "title":
        - Create a short, meaningful event title based on the message.
        - If unclear, infer a reasonable title from context.

        3. "participants":
        - Extract names, email addresses, or groups mentioned.
        - Return an empty array if none are found.

        4. "date":
        - Convert dates like "tomorrow", "next Monday", "5th Jan", etc. into format (DD-MM-YYYY).
        - If no date is mentioned, return an empty string.

        5. "time":
        - Convert times like "3 pm", "evening", "11:30", "after lunch" into HH:MM (24-hour format).
        - If unclear or missing, return an empty string.

        6. "reminder":
        - Extract reminders like "remind me 10 mins before", "1 hour before", "a day before".
        - Default: "30m" if user wants an event but no reminder is specified.

        7. If any field is not applicable or missing, return an empty string or empty array as appropriate.

        8. Give back just the JSON without any extra text or explanation.

    `
    getJSONFromText(customPrompt, userText).then(async  (responseText) => {

        const jsonResponse = await responseParser(responseText);
        const jsonString  = JSON.stringify(jsonResponse, null, 2 );

        context.reply(jsonString);
        
    }).catch((error) => {
        console.error("Error processing user message:", error);
        context.reply("Sorry, there was an error processing your message.");
    });



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