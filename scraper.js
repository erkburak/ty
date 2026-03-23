const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeTrendyolReviews(barcode) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1280,1000'
            ]
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log(`[Scraper] Aranıyor: ${barcode}`);
        await page.goto(`https://www.trendyol.com/sr?q=${encodeURIComponent(barcode)}`, { waitUntil: 'networkidle2' });
        
        // Wait a bit for potential lazy loading or banners
        await new Promise(r => setTimeout(r, 2000));

        // Find first product link - more flexible selectors
        const productUrl = await page.evaluate(() => {
            // Try standard product card
            let el = document.querySelector('.product-card a') || 
                     document.querySelector('.p-card-chldrn-cntnr a') ||
                     document.querySelector('a.product-card') ||
                     // Fallback: any link containing product-p- or /something-p-123
                     Array.from(document.querySelectorAll('a')).find(a => /-p-\d+/.test(a.href));
            
            return el ? el.href : null;
        });

        if (!productUrl) {
            console.log(`[Scraper] Ürün linki bulunamadı: ${barcode}`);
            await browser.close();
            return null;
        }

        console.log(`[Scraper] Ürün sayfasına gidiliyor: ${productUrl}`);
        await page.goto(productUrl, { waitUntil: 'networkidle2' });

        const contentIdMatch = productUrl.match(/-p-(\d+)/);
        if (!contentIdMatch) {
            console.log('[Scraper] Ürün ID bulunamadı');
            await browser.close();
            return null;
        }
        const contentId = contentIdMatch[1];
        console.log(`[Scraper] contentId: ${contentId}`);

        // Fetch API data from WITHIN the page context
        console.log(`[Scraper] Review API verisi çekiliyor...`);
        // Use a standard pageSize like 40 to stay under the radar but enough for filtering
        const apiUrl = `https://apigw.trendyol.com/discovery-storefront-trproductgw-service/api/review-read/product-reviews/detailed?contentId=${contentId}&page=0&pageSize=50&order=DESC&orderBy=Score&channelId=1`;
        
        const reviewData = await page.evaluate(async (url) => {
            try {
                const response = await fetch(url);
                const json = await response.json();
                return json;
            } catch (e) {
                return { error: e.message };
            }
        }, apiUrl);

        if (!reviewData || !reviewData.result) {
            console.log('[Scraper] API verisi alınamadı (result alanı yok)');
            await browser.close();
            return null;
        }

        const result = reviewData.result;
        console.log(`[Scraper] ${result.reviews ? result.reviews.length : 0} yorum alındı!`);

        const summary = result.summary || {};
        const overallRating = summary.averageRating || 0;
        const totalReviews = summary.totalRatingCount || 0;
        
        const reviews = (result.reviews || []).map((r, i) => ({
            id: i + 1,
            author: r.userFullName || 'Kullanıcı',
            rating: r.rate || 5,
            date: r.createdAt
                ? new Date(r.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
                : '',
            text: r.comment || '',
            photos: (r.mediaFiles || []).map(m => m.url || m.imageUrl || m).filter(u => typeof u === 'string' && u.startsWith('http')),
            verified: r.trusted || true
        })).filter(r => r.text.length > 0);

        await browser.close();
        return { overallRating, totalReviews, reviews };

    } catch (error) {
        console.error("[Scraper] Hata:", error.message);
        if (browser) await browser.close();
        throw error;
    }
}

module.exports = { scrapeTrendyolReviews };

if (require.main === module) {
    const testBarcode = process.argv[2] || "TYBV3AGC4O7HDWB930";
    console.log(`Testing scraper with: ${testBarcode}`);
    scrapeTrendyolReviews(testBarcode)
        .then(r => {
            if (r) {
                console.log(`Result: ${r.reviews.length} reviews found, rating: ${r.overallRating}`);
            } else {
                console.log("No result found.");
            }
        })
        .catch(console.error);
}
