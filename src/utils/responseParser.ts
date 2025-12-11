import type { NarrowedContext } from "telegraf";



const responseParser = (responseText: string): JSON => {
    
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

    return JSON.parse(jsonString);


}

export {responseParser}