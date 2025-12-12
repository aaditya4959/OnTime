import type { NarrowedContext } from "telegraf";
import { buildFollowupQuestion } from "./followUP.js";
import * as z from "zod";

const llmResponseSchema = z.object({
    intent: z.string(),

    title: z.string(),

    participants: z.array(z.string())
        .nonempty("participants"),

    date: z.string()
        .min(1, "date"),

    time: z.string()
        .min(1, "time"),

    reminder: z.string()
});


interface LLMResponse {
    needs_more_info?: boolean;
    ask?: string;
    missing_fields?: string[];
    intent?: string;
    title?: string;
    participants?: string[];
    date?: string;
    time?: string;
    reminder?: string;
}

const responseParser = async (responseText: string): Promise<LLMResponse> => {
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/);

    let jsonString = "";
    let textString = responseText;

    if (jsonMatch) {
        //@ts-ignore
        jsonString = jsonMatch[1].trim(); 
        textString = responseText.replace(jsonMatch[0], "").trim();
    } else {
        jsonString = responseText;
    }

    let parsedJson;

    // Parse JSON safely
    try {
        parsedJson = JSON.parse(jsonString);
    } catch (e) {
        return {
            needs_more_info: true,
            ask: "I couldn't understand that. Can you rephrase?",
            missing_fields: ["invalid_json"]
        };
    }

    // Validate JSON using Zod
    const parsed = llmResponseSchema.safeParse(parsedJson);

    if (!parsed.success) {
        const missingFields = parsed.error.issues.map(issue => issue.path.join("."));
        
        return {
            needs_more_info: true, //@ts-ignore
            ask: buildFollowupQuestion(missingFields),
            missing_fields: missingFields
        };
    }

    // SUCCESS → Spread validated data into the response
    return {
        needs_more_info: false,
        ...parsed.data
    };
};

export { responseParser };
