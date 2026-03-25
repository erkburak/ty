const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeTrendyolReviews(barcode) {
    let browser;
    try {
        console.log(`[Scraper] Aranıyor: ${barcode}`);
        
        const launchOptions = {
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
            headless: "new"
        };

        // Render.com veya Docker ortamında özel bir path gerekebilir ama 
        // npx puppeteer browsers install chrome ile yüklendiğinde otomatik bulunması için 
        // executablePath'i opsiyonel yapıyoruz.
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }

        browser = await puppeteer.launch(launchOptions);

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log(`[Scraper] Trendyol aranıyor...`);
        await page.goto(`https://www.trendyol.com/sr?q=${encodeURIComponent(barcode)}`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000));

        const productUrl = await page.evaluate(() => {
            let el = document.querySelector('.product-card a') || 
                     document.querySelector('.p-card-chldrn-cntnr a') ||
                     document.querySelector('a.product-card') ||
                     Array.from(document.querySelectorAll('a')).find(a => /-p-\d+/.test(a.href));
            return el ? el.href : null;
        });

        if (!productUrl) {
            console.log(`[Scraper] Ürün bulunamadı: ${barcode}`);
            await browser.close();
            return null;
        }

        console.log(`[Scraper] Ürün sayfası: ${productUrl}`);
        await page.goto(productUrl, { waitUntil: 'networkidle2' });

        const contentIdMatch = productUrl.match(/-p-(\d+)/);
        if (!contentIdMatch) {
            console.log('[Scraper] ContentId bulunamadı');
            await browser.close();
            return null;
        }
        const contentId = contentIdMatch[1];
        console.log(`[Scraper] contentId: ${contentId}`);

        console.log(`[Scraper] Review API çağrılıyor...`);
        const apiUrl = `https://apigw.trendyol.com/discovery-storefront-trproductgw-service/api/review-read/product-reviews/detailed?contentId=${contentId}&page=0&pageSize=50&order=DESC&orderBy=Score&channelId=1`;
        
        const reviewData = await page.evaluate(async (url) => {
            try {
                const response = await fetch(url);
                return await response.json();
            } catch (e) {
                return null;
            }
        }, apiUrl);

        if (!reviewData || !reviewData.result) {
            console.log('[Scraper] API verisi boş');
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
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
            text: r.comment || '',
            photos: (r.mediaFiles || []).map(m => m.url || m.imageUrl || m).filter(u => typeof u === 'string' && u.startsWith('http')),
            verified: r.trusted || true
        })).filter(r => r.text.length > 0);

        await browser.close();
        return { overallRating, totalReviews, reviews };

    } catch (error) {
        console.error("[Scraper Hata Detayı]:", error);
        if (browser) await browser.close();
        throw error;
    }
}

module.exports = { scrapeTrendyolReviews };
