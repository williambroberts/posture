export function insertTextAfterSubstring(originalString:string, substring:string, textToInsert:string) {
    const index = originalString.indexOf(substring);
    if (index === -1) {
        // Substring not found, return the original string
        return originalString;
    }
    // Calculate the position after the substring
    const insertPosition = index + substring.length;
    // Insert the text and return the new string
    return originalString.slice(0, insertPosition) + textToInsert + originalString.slice(insertPosition);
}

export function appendToString(originalString:string,textToInsert:string){
    return originalString + textToInsert;
}

export function replaceSubstring(originalString:string,textToReplace:string,replacement:string){
    return originalString.replace(textToReplace, replacement);
}