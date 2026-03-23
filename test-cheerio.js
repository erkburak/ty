const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('debug-reviews.html', 'utf8');
const $ = cheerio.load(html);

// Inspect the full star container of first review
const firstReview = $('.review').eq(0);
const starContainer = firstReview.find('[data-testid="star-rating"]');

console.log("Full star container HTML:\n");
console.log(starContainer.prop('outerHTML'));
console.log("\n\n--- Height style ---");
console.log("style attr:", starContainer.attr('style'));

// Look for aria-label or similar attributes that may hold the rating
console.log("\nLooking for aria-label containing rating...");
$('[aria-label]').each(function() {
    const label = $(this).attr('aria-label');
    if (label && (label.includes('yıldız') || label.includes('star') || label.includes('puan'))) {
        console.log('aria-label:', label);
    }
});

// Check overall-rating structure
console.log("\n\n=== OVERALL RATING AREA ===");
const summary = $('.review-summary, .summary, [class*="summary"]').first();
console.log("summary class:", summary.attr('class'));
console.log("summary text:", summary.text().substring(0, 100));

const overallRating = $('[class*="overall"], [class*="rating-score"], .ratingScore').first();
console.log("\noverall el:", overallRating.attr('class'), "|", overallRating.text().substring(0, 50));

// Try to find all elements with rating numbers
$('*').filter(function() {
    const txt = $(this).clone().children().remove().end().text().trim();
    return /^[1-5]\.\d+$/.test(txt);
}).each(function() {
    console.log("Possible rating element:", $(this).attr('class'), "=>", $(this).clone().children().remove().end().text().trim());
});
