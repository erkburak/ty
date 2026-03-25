const { scrapeTrendyolReviews } = require('./scraper');

async function test() {
    // Test için gerçek bir barkod (iPhone 16 Pro Max veya JBL)
    const testBarcodes = [
        '195949805790', // iPhone 16 Pro Max
        '6925281964725', // JBL Tune 520BT
        'TYBV3AGC4O7HDWB930' // Kullanıcının orijinal barkodu (icollagen)
    ];

    for (const barcode of testBarcodes) {
        console.log(`\n--- Test Başlatılıyor: ${barcode} ---`);
        try {
            const result = await scrapeTrendyolReviews(barcode);
            if (result) {
                console.log(`✅ BAŞARILI: ${barcode}`);
                console.log(`⭐ Ortalama Puan: ${result.overallRating}`);
                console.log(`💬 Toplam Yorum: ${result.totalReviews}`);
                console.log(`📝 İlk Yorum Snippet: ${result.reviews[0]?.text.substring(0, 50)}...`);
            } else {
                console.log(`❌ Ürün veya yorum bulunamadı: ${barcode}`);
            }
        } catch (error) {
            console.error(`❌ HATA (${barcode}):`, error.message);
        }
    }
}

test();
