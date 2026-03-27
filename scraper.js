const axios = require('axios');

// Axios instance with cookie support
const client = axios.create({
    timeout: 20000,
    maxRedirects: 5,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
    }
});

// Session cookie'lerini al
let sessionCookies = '';
let lastSessionTime = 0;
const SESSION_TTL = 10 * 60 * 1000; // 10 dakika

async function getSession() {
    // Session hâlâ tazeyse tekrar alma
    if (sessionCookies && (Date.now() - lastSessionTime < SESSION_TTL)) {
        return sessionCookies;
    }

    console.log('[Session] Trendyol session cookie alınıyor...');
    try {
        const res = await client.get('https://www.trendyol.com/', {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0',
            },
            validateStatus: () => true, // 403 bile olsa cookie'leri al
        });

        const setCookies = res.headers['set-cookie'] || [];
        sessionCookies = setCookies.map(c => c.split(';')[0]).join('; ');
        lastSessionTime = Date.now();
        console.log(`[Session] ${setCookies.length} cookie alındı`);
    } catch (err) {
        console.log(`[Session] Cookie alınamadı: ${err.message}`);
        sessionCookies = '';
    }
    return sessionCookies;
}

async function findContentId(barcode) {
    const cookies = await getSession();

    const apiHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://www.trendyol.com',
        'Referer': 'https://www.trendyol.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
    };
    if (cookies) apiHeaders['Cookie'] = cookies;

    const htmlHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.trendyol.com/',
    };
    if (cookies) htmlHeaders['Cookie'] = cookies;

    // Yöntem 1: Trendyol Search API (JSON)
    try {
        console.log(`[Scraper] Yöntem 1: Search API...`);
        const url = `https://apigw.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?q=${encodeURIComponent(barcode)}&qt=${encodeURIComponent(barcode)}&st=${encodeURIComponent(barcode)}&os=1&pi=1&culture=tr-TR&userGenderId=1&pId=0&scoringAlgorithmId=2&categoryRelevancyEnabled=false&isLegalRequirementConfirmed=false&searchStrategyType=DEFAULT&productStampType=TypeA&fixSlicers=true`;
        const res = await client.get(url, { headers: apiHeaders });
        const products = res.data?.result?.products;
        if (products && products.length > 0) {
            const id = products[0].id || products[0].contentId;
            if (id) { console.log(`[Scraper] Yöntem 1 OK! contentId: ${id}`); return String(id); }
        }
    } catch (err) {
        console.log(`[Scraper] Yöntem 1 fail: ${err.response?.status || err.message}`);
    }

    // Yöntem 2: HTML arama sayfası + regex
    try {
        console.log(`[Scraper] Yöntem 2: HTML arama...`);
        const url = `https://www.trendyol.com/sr?q=${encodeURIComponent(barcode)}`;
        const res = await client.get(url, { headers: htmlHeaders });
        // __SEARCH_RESULT_PRODUCTS__ içinden product ID bul
        const stateMatch = res.data.match(/"id"\s*:\s*(\d{5,})/);
        if (stateMatch) {
            console.log(`[Scraper] Yöntem 2 OK! contentId: ${stateMatch[1]}`);
            return stateMatch[1];
        }
        // Alternatif: URL'den -p-XXXXX
        const linkMatch = res.data.match(/-p-(\d+)/);
        if (linkMatch) {
            console.log(`[Scraper] Yöntem 2 (link) OK! contentId: ${linkMatch[1]}`);
            return linkMatch[1];
        }
    } catch (err) {
        console.log(`[Scraper] Yöntem 2 fail: ${err.response?.status || err.message}`);
    }

    // Yöntem 3: Mobil API
    try {
        console.log(`[Scraper] Yöntem 3: Mobil API...`);
        const mobileHeaders = {
            'User-Agent': 'Trendyol/6.0.0 (Android 13; SM-S908B)',
            'Accept': 'application/json',
            'Accept-Language': 'tr-TR',
            'x-storefrontid': '1',
            'culture': 'tr-TR',
        };
        if (cookies) mobileHeaders['Cookie'] = cookies;
        const url = `https://apigw.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?q=${encodeURIComponent(barcode)}&os=1&pi=1&culture=tr-TR`;
        const res = await client.get(url, { headers: mobileHeaders });
        const products = res.data?.result?.products;
        if (products && products.length > 0) {
            const id = products[0].id || products[0].contentId;
            if (id) { console.log(`[Scraper] Yöntem 3 OK! contentId: ${id}`); return String(id); }
        }
    } catch (err) {
        console.log(`[Scraper] Yöntem 3 fail: ${err.response?.status || err.message}`);
    }

    // Yöntem 4: Google üzerinden Trendyol ürün linki bul
    try {
        console.log(`[Scraper] Yöntem 4: Google arama...`);
        const googleUrl = `https://www.google.com/search?q=site:trendyol.com+${encodeURIComponent(barcode)}&num=3`;
        const res = await client.get(googleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9',
            }
        });
        const match = res.data.match(/trendyol\.com[^"]*-p-(\d+)/);
        if (match) {
            console.log(`[Scraper] Yöntem 4 OK! contentId: ${match[1]}`);
            return match[1];
        }
    } catch (err) {
        console.log(`[Scraper] Yöntem 4 fail: ${err.response?.status || err.message}`);
    }

    return null;
}

async function scrapeTrendyolReviews(barcode, directContentId) {
    try {
        let contentId;

        if (directContentId) {
            console.log(`[Scraper] Doğrudan contentId kullanılıyor: ${directContentId}`);
            contentId = directContentId;
        } else {
            console.log(`[Scraper] Barkod ile aranıyor: ${barcode}`);
            contentId = await findContentId(barcode);
        }

        if (!contentId) {
            console.log(`[Scraper] Ürün bulunamadı: ${barcode}`);
            return null;
        }

        // Review API - bu genelde engellenmez
        console.log(`[Scraper] Review API çağrılıyor (contentId: ${contentId})...`);
        const cookies = await getSession();
        const apiUrl = `https://apigw.trendyol.com/discovery-storefront-trproductgw-service/api/review-read/product-reviews/detailed?contentId=${contentId}&page=0&pageSize=50&order=DESC&orderBy=Score&channelId=1`;

        const reviewHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://www.trendyol.com',
            'Referer': 'https://www.trendyol.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
        };
        if (cookies) reviewHeaders['Cookie'] = cookies;

        const apiResponse = await client.get(apiUrl, { headers: reviewHeaders });
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
