const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeTrendyolReviews(barcode) {
    try {
        console.log(`[Scraper] Aranıyor: ${barcode}`);

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.trendyol.com/'
        };

        // 1. Trendyol'da ürünü ara
        console.log(`[Scraper] Trendyol aranıyor...`);
        const searchUrl = `https://www.trendyol.com/sr?q=${encodeURIComponent(barcode)}`;
        const searchResponse = await axios.get(searchUrl, { headers, timeout: 15000 });
        const $ = cheerio.load(searchResponse.data);

        // Ürün linkini bul
        let productUrl = null;
        const productLink = $('a[href*="-p-"]').first().attr('href');
        if (productLink) {
            productUrl = productLink.startsWith('http') ? productLink : `https://www.trendyol.com${productLink}`;
        }

        if (!productUrl) {
            console.log(`[Scraper] Ürün bulunamadı: ${barcode}`);
            return null;
        }

        console.log(`[Scraper] Ürün sayfası: ${productUrl}`);

        // 2. Content ID'yi URL'den çıkar
        const contentIdMatch = productUrl.match(/-p-(\d+)/);
        if (!contentIdMatch) {
            console.log('[Scraper] ContentId bulunamadı');
            return null;
        }
        const contentId = contentIdMatch[1];
        console.log(`[Scraper] contentId: ${contentId}`);

        // 3. Review API'yi doğrudan çağır
        console.log(`[Scraper] Review API çağrılıyor...`);
        const apiUrl = `https://apigw.trendyol.com/discovery-storefront-trproductgw-service/api/review-read/product-reviews/detailed?contentId=${contentId}&page=0&pageSize=50&order=DESC&orderBy=Score&channelId=1`;

        const apiHeaders = {
            ...headers,
            'Accept': 'application/json',
            'Origin': 'https://www.trendyol.com',
            'Referer': productUrl
        };

        const apiResponse = await axios.get(apiUrl, { headers: apiHeaders, timeout: 15000 });
        const reviewData = apiResponse.data;

        if (!reviewData || !reviewData.result) {
            console.log('[Scraper] API verisi boş');
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

        return { overallRating, totalReviews, reviews };

    } catch (error) {
        console.error("[Scraper Hata Detayı]:", error.message);
        throw error;
    }
}

module.exports = { scrapeTrendyolReviews };
