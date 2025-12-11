function buildFollowupQuestion(fields: string[]) {
    if (fields.length === 1) {
        return generateQuestion(fields[0]);
    }

    // For multiple missing fields → ask them one by one
    return fields.map(f => generateQuestion(f));
}

function generateQuestion(field: any): string {
    switch (field) {
        case "title":
            return "What should be the title of the event?";
        case "date":
            return "On which date should I schedule this event?";
        case "time":
            return "At what time should I schedule it?";
        case "participants":
            return "Whom should I add as participants?";
        case "reminder":
            return "When do you want me to remind you?";
        default:
            return `I need more information for: ${field}`;
    }
}

export { buildFollowupQuestion };
