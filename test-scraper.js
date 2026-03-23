const axios = require('axios');
const cheerio = require('cheerio');

async function test(query) {
    try {
        console.log("Searching for:", query);
        const url = `https://www.trendyol.com/sr?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        
        const $ = cheerio.load(data);
        const scriptTags = $('script');
        let initialStateStr = '';
        scriptTags.each((i, el) => {
           const html = $(el).html();
           if (html && html.includes('window.__INITIAL_STATE__=')) {
               initialStateStr = html;
           }
        });
        
        if (initialStateStr) {
            let jsonStr = initialStateStr.replace('window.__INITIAL_STATE__=', '').trim();
            if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
            
            try {
                const state = JSON.parse(jsonStr);
                const products = state.search.appender.products || [];
                console.log(`Found ${products.length} products in initial state.`);
                if (products.length > 0) {
                    const firstProduct = products[0];
                    console.log(`First product ID: ${firstProduct.id}`);
                    console.log(`First product Name: ${firstProduct.name}`);
                    return firstProduct.id;
                }
            } catch (e) {
                console.log("Failed to parse JSON directly, using regex.");
                const contentIdMatch = jsonStr.match(/"id":(\d+),"name":"([^"]+)"/);
                if (contentIdMatch) {
                    console.log("Regex found Product ID:", contentIdMatch[1]);
                    console.log("Regex found Name:", contentIdMatch[2]);
                    return contentIdMatch[1];
                }
            }
        } else {
             console.log("No initial state found.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test("apple watch");
