const axios = require('axios');
const cheerio = require('cheerio');

async function testLightweight(barcode) {
    try {
        console.log(`[Test] Searching for barcode: ${barcode}`);
        const searchUrl = `https://www.trendyol.com/sr?q=${encodeURIComponent(barcode)}`;
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const firstProduct = $('.product-card a').attr('href') || $('.p-card-chldrn-cntnr a').attr('href');
        
        if (!firstProduct) {
            console.log("[Test] Product not found via axios");
            return;
        }

        const productUrl = firstProduct.startsWith('http') ? firstProduct : `https://www.trendyol.com${firstProduct}`;
        console.log(`[Test] Found product: ${productUrl}`);
        
        const contentIdMatch = productUrl.match(/-p-(\d+)/);
        if (!contentIdMatch) {
            console.log("[Test] ContentId not found in URL");
            return;
        }
        const contentId = contentIdMatch[1];
        console.log(`[Test] contentId: ${contentId}`);

        // Try to fetch API directly
        const apiUrl = `https://apigw.trendyol.com/discovery-storefront-trproductgw-service/api/review-read/product-reviews/detailed?contentId=${contentId}&page=0&pageSize=10&order=DESC&orderBy=Score&channelId=1`;
        
        const apiRes = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': productUrl
            }
        });

        console.log(`[Test] API Response received! Status: ${apiRes.status}`);
        console.log(`[Test] Reviews count: ${apiRes.data.result?.reviews?.length || 0}`);

    } catch (e) {
        console.error("[Test] Error:", e.message);
    }
}

testLightweight("8698902683128");
