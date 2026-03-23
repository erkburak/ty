const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

async function debug() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    });
    
    const productUrl = "https://www.trendyol.com/apple/yenilenmis-iphone-13-128-gb-yildiz-isigi-cep-telefonu-12-ay-garantili-a-kalite-p-812982801/yorumlar";
    console.log("Going to: " + productUrl);
    await page.goto(productUrl, { waitUntil: 'networkidle2' });
    
    // Wait a bit to ensure Client-Side Rendering is done
    await new Promise(r => setTimeout(r, 2000));
    
    await page.screenshot({ path: 'debug-reviews.png' });
    fs.writeFileSync('debug-reviews.html', await page.content());
    
    await browser.close();
    console.log("Debug reviews saved.");
}
debug();
