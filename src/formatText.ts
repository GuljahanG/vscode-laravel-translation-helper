function toCamelCase(text: string): string {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toLowerCase() : match.toUpperCase()
        )
        .replace(/\s+/g, ''); // Remove spaces after transforming to camelCase
}


function toSnakeCase(text: string): string {
    return text.replace(/\s+/g, '_'); // Replace spaces with underscores
}


export function formatText(text: string, format: string): string {
    let formattedText = text.trim().toLowerCase();

    if (format === 'camelCase') {
        formattedText = toCamelCase(formattedText);
    } else if (format === 'snake_case') {
        formattedText = toSnakeCase(formattedText);
    }

    // Remove non-alphanumeric characters
    return formattedText.replace(/[^\w]/g, '');
}