export function extractBySymbol(text, symbol) {
    // const regex = new RegExp( `#(\w+)` , "g");
    const regex = new RegExp(`${symbol}(\\w+)`, "g");
    let match;
    const results = [];

    while ((match = regex.exec(text)) !== null) {
        results.push(match[1]);
    }

    return results;
}

