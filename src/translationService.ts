export async function translateText(text: string, targetLang: string, sourceLang = 'auto'): Promise<string> {
    const url = 'https://translate.googleapis.com/translate_a/single?';
    const params = {
        client: 'at',
        dt: 't',   //return sentences
        sl: 'auto', //from
        tl: targetLang, //to
        q: text
    };
    const queryString = new URLSearchParams(params).toString();

    try {
        const response = await fetch(url + queryString, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultArrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        const resultText = decoder.decode(resultArrayBuffer);
        const result = JSON.parse(resultText);
        return result[0][0][0];
    } catch (error) {
        throw new Error('Error with translation request: ' + error);
    }
}
