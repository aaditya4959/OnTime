import type { NarrowedContext } from "telegraf";
import { buildFollowupQuestion } from "./followUP.js";
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
    needs_more_info?: boolean;
    ask?: string;
    missing_fields?: string[];
    intent: string;
    title: string;
    participants: string[];
    date: string
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
        console.error("Invalid LLM response:", parsed.error);

        // Extract which fields are missing/invalid
        const issues = parsed.error.issues;

        const missingFields = issues.map(issue => issue.path.join("."));

        return {
            needs_more_info: true,
            //@ts-ignore
            ask: buildFollowupQuestion(missingFields),
            missing_fields: missingFields
        };
    }
    return {
        needs_more_info: false,
        //@ts-ignore
        data: parsed.data
    };

    return JSON.parse(jsonString);


}

export {responseParser}