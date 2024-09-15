import { translate } from '@vitalets/google-translate-api';
// import { HttpProxyAgent } from 'http-proxy-agent';
// import { getProxies } from './getProxies';

// const proxies = getProxies();
// let currentProxyIndex = 0;

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

//export async function fetchTranslation(text: string, from: string, to: string, retries = proxies.length): Promise<string> {
    // if (proxies.length === 0) {
    //     try {
    //         const { text: translatedText } = await translate(text, { from, to });
    //         return translatedText;
    //     } catch (error) {
    //         console.error("Translation error without proxy: ", error);
    //         return text; // Return original text on error
    //     }
    // }else{
    //     const proxy = proxies[currentProxyIndex];
    //     const agent = new HttpProxyAgent(proxy);
    
    //     try {
    //         const { text: translatedText } = await translate(text, {
    //             to: to,
    //             fetchOptions: { agent }
    //         });
    //         return translatedText;
    //     } catch (error) {
    //         console.error("Translation error: ", error);
    
    //         // Type guard to check if error is an instance of Error
    //         if (error instanceof Error) {
    //             // If the error response is available and status is 429, retry with the next proxy
    //             if ((error as any).response?.status === 429 && retries > 0) {
    //                 // Rotate proxy
    //                 currentProxyIndex = (currentProxyIndex + 1) % proxies.length; // Rotate proxy
    //                 console.log(`Retrying with proxy: ${proxies[currentProxyIndex]}`);
    //                 // Retry with a different proxy
    //                 await new Promise(res => setTimeout(res, 2000)); // Optional: delay before retry
    //                 return fetchTranslation(text, from, to, retries - 1);
    //             } else {
    //                 // Return original text if out of retries or another error
    //                 return text;
    //             }
    //         } else {
    //             // Handle unexpected error types
    //             console.error("Unexpected error type: ", typeof error);
    //             return text;
    //         }
    //     }

   // }   
//}