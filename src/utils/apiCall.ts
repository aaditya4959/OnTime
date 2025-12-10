import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Client gets the api key from the environment variable GOOGLE_API_KEY
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
})

const getJSONFromText = async (prompt: string, userText: string)=> {
    const now = new Date();
    const day = now.getDay()-1;
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // for the context of present date and time
    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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


