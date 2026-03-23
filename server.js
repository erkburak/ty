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
    if (!barcode) {
        return res.status(400).json({ error: "Barcode is required" });
    }

    console.log(`Request received for barcode: ${barcode}`);
    const cache = getCache();
    const cachedItem = cache[barcode];

    // Check if cache is valid
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_DURATION_MS)) {
        console.log(`[Cache Hit] Returning cached reviews for ${barcode}`);
        return res.json(cachedItem.data);
    }

    console.log(`[Cache Miss] Scraping reviews for ${barcode}...`);
    try {
        const data = await scrapeTrendyolReviews(barcode);
        
        if (!data) {
            return res.status(404).json({ error: "Product or reviews not found" });
        }

        // Save to cache
        cache[barcode] = {
            timestamp: Date.now(),
            data: data
        };
        saveCache(cache);

        res.json(data);
    } catch (error) {
        console.error(`[CRITICAL ERROR] Scraping failed for barcode ${barcode}:`, error);
        res.status(500).json({ 
            error: "Internal server error during scraping",
            message: error.message,
            barcode: barcode
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
