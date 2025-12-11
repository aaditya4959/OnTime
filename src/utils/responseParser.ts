import type { NarrowedContext } from "telegraf";
import * as z from "zod";


const llmResponseSchema = z.object({
    intent: z.string(),
    title: z.string(),
    participants: z.array(z.string()),
    date: z.string(),
    time: z.string(),
    reminder: z.string()
})

interface LLMResponse {
    intent: string;
    title: string;
    participants: string[];
    date: string;
    time: string;
    reminder: string;
}


const responseParser = async (responseText: string):Promise<LLMResponse>  => {
    
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/);

    let jsonString = "";
    let textString = responseText;

    if (jsonMatch) {
        //@ts-ignore
        jsonString = jsonMatch[1].trim(); // JSON code block
        textString = responseText.replace(jsonMatch[0], "").trim(); // rest of the text
    } else {
        jsonString = responseText;
    }
    // Validate and parse the JSON string using Zod
    const parsed = await llmResponseSchema.safeParse(JSON.parse(jsonString));

    if (!parsed.success) {
        console.error("Invalid LLM response format:", parsed.error);
        throw new Error("Invalid LLM response format");
    }

    return JSON.parse(jsonString);


}

export {responseParser}