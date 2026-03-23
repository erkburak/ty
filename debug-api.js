const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debug() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    let done = false;
    page.on('response', async (response) => {
        if (done) return;
        const url = response.url();
        if (url.includes('/review-read/product-reviews/detailed') && url.includes('order=DESC')) {
            try {
                const text = await response.text();
                const json = JSON.parse(text);
                const result = json.result || json;
                console.log("SUMMARY keys:", Object.keys(result.summary || {}));
                console.log("SUMMARY:", JSON.stringify(result.summary, null, 2).substring(0, 400));
                const reviews = result.reviews || [];
                if (reviews.length > 0) {
                    console.log("\nFirst review keys:", Object.keys(reviews[0]));
                    console.log("First review:", JSON.stringify(reviews[0], null, 2).substring(0, 600));
                }
                done = true;
            } catch(e) {}
        }
    });
    
    await page.goto('https://www.trendyol.com/apple/yenilenmis-iphone-13-128-gb-yildiz-isigi-cep-telefonu-12-ay-garantili-a-kalite-p-812982801/yorumlar', 
        { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
}

debug().catch(console.error);
