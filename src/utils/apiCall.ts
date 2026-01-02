import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Client gets the api key from the environment variable GOOGLE_API_KEY
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
})

const getJSONFromText = async (prompt: string, userText: string)=> {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const date= now.getDate();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
        
    

    // for the context of present date and time (ISO + readable)
    const iso = now.toISOString();
    const formattedDateTime = `${iso} (Local: ${date}/${month}/${year} ${hours}:${minutes}:${seconds} - ${days[day]})`;
    try{
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents : [
                prompt,
                `User Message: "${userText}"`,
                `Current Date and Time: "${formattedDateTime}".`

            ]
        });

        return response.text || "Nothing Generated";
    }
    catch(err){
        console.error("Error generating content from Gemini API:", err);
        return "Error generating content";
    }
    


}

export { getJSONFromText};


