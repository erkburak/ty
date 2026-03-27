const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { scrapeTrendyolReviews } = require('./scraper');

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const CACHE_FILE = path.join(__dirname, 'cache.json');
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({}));
}

function getCache() {
    try {
        const data = fs.readFileSync(CACHE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function saveCache(cache) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

app.get('/api/reviews', async (req, res) => {
    const barcode = req.query.barcode;
    const contentId = req.query.contentId;
    if (!barcode && !contentId) {
        return res.status(400).json({ error: "Barcode or contentId is required" });
    }
    const cacheKey = contentId ? `cid_${contentId}` : barcode;

    console.log(`Request received: ${contentId ? 'contentId=' + contentId : 'barcode=' + barcode}`);
    const cache = getCache();
    const cachedItem = cache[cacheKey];

    // Check if cache is valid
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION_MS)) {
        console.log(`[Cache Hit] Returning cached reviews for ${cacheKey}`);
        return res.json(cachedItem.data);
    }

    console.log(`[Cache Miss] Fetching reviews for ${cacheKey}...`);
    try {
        const data = contentId 
            ? await scrapeTrendyolReviews(null, contentId)
            : await scrapeTrendyolReviews(barcode);
        
        if (!data) {
            console.warn(`[API] Ürün veya yorum bulunamadı: ${cacheKey}`);
            return res.status(404).json({ 
                error: "Not Found",
                message: "Bu ürüne ait yorum Trendyol üzerinde bulunamadı.",
                query: cacheKey 
            });
        }

        // Save to cache
        cache[cacheKey] = {
            timestamp: Date.now(),
            data: data
        };
        saveCache(cache);

        res.json(data);
    } catch (error) {
        console.error(`[CRITICAL ERROR] Failed for ${cacheKey}:`, error);
        res.status(500).json({ 
            error: "Internal Server Error",
            message: error.message || "Sunucu tarafında bir hata oluştu.",
            query: cacheKey,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Trendyol Reviews API listening on port ${PORT}`);
    });
}

module.exports = app;
