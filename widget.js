(function () {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .ty-widget {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;            margin: 32px auto;
            color: #1a1a2e;
            box-sizing: border-box;
        }
        .ty-widget * { box-sizing: border-box; }

        /* ── Header ── */
        .ty-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 24px;
        }
        .ty-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .ty-logo {
            background: linear-gradient(135deg, #FF6000, #FF8C00);
            color: #fff;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.2px;
            padding: 5px 10px;
            border-radius: 7px;
            text-transform: uppercase;
        }
        .ty-heading {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
            color: #111;
        }
        .ty-score-box {
            display: flex;
            align-items: center;
            gap: 14px;
            background: linear-gradient(135deg, #fff8f3, #fff);
            border: 1.5px solid #ffe0c8;
            border-radius: 14px;
            padding: 12px 20px;
        }
        .ty-score-num {
            font-size: 40px;
            font-weight: 800;
            line-height: 1;
            color: #FF6000;
        }
        .ty-score-stars { font-size: 20px; color: #FF9500; letter-spacing: 2px; margin-bottom: 2px; }
        .ty-score-count { font-size: 13px; color: #888; font-weight: 500; }

        /* ── Filters ── */
        .ty-filters {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            flex-wrap: wrap;
            border-bottom: 1.5px solid #f0f0f0;
            padding-bottom: 16px;
        }
        .ty-filter-btn {
            background: #fff;
            border: 1.5px solid #eee;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: #666;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .ty-filter-btn:hover { border-color: #FF6000; color: #FF6000; background: #fff8f3; }
        .ty-filter-btn.active {
            background: #FF6000;
            border-color: #FF6000;
            color: #fff;
            box-shadow: 0 4px 12px rgba(255, 96, 0, 0.2);
        }
        .ty-filter-stars { color: #fbc02d; margin-right: 2px; }

        /* ── Review Grid ── */
        .ty-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }

        /* ── Card ── */
        .ty-card {
            background: #fff;
            border: 1.5px solid #f0f0f0;
            border-radius: 18px;
            padding: 22px 24px;
            transition: box-shadow 0.25s, transform 0.25s;
            position: relative;
            overflow: hidden;
            display: none; /* Hidden by default for pagination */
        }
        .ty-card.visible { display: block; }

        .ty-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, #FF6000, #FF9500);
            opacity: 0;
            transition: opacity 0.25s;
        }
        .ty-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.09); transform: translateY(-2px); }
        .ty-card:hover::before { opacity: 1; }

        /* ── Card Header ── */
        .ty-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 14px;
        }
        .ty-user { display: flex; align-items: center; gap: 12px; }
        .ty-avatar {
            width: 44px; height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f6d365, #fda085);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; font-weight: 700; color: #fff;
            flex-shrink: 0;
        }
        .ty-avatar.c0 { background: linear-gradient(135deg, #f6d365, #fda085); }
        .ty-avatar.c1 { background: linear-gradient(135deg, #a18cd1, #fbc2eb); }
        .ty-avatar.c2 { background: linear-gradient(135deg, #84fab0, #8fd3f4); }
        .ty-avatar.c3 { background: linear-gradient(135deg, #fccb90, #d57eeb); }
        .ty-avatar.c4 { background: linear-gradient(135deg, #43e97b, #38f9d7); }
        .ty-name { font-weight: 700; font-size: 15px; color: #111; }
        .ty-stars-sm { font-size: 13px; color: #FF9500; letter-spacing: 1px; margin-top: 2px; }
        .ty-meta { text-align: right; flex-shrink: 0; }
        .ty-date { font-size: 12px; color: #bbb; font-weight: 500; margin-bottom: 6px; }
        .ty-badge {
            display: inline-flex; align-items: center; gap: 4px;
            background: #ebfaf2; color: #1aa05b;
            font-size: 11px; font-weight: 600;
            padding: 3px 9px; border-radius: 20px;
        }
        .ty-badge svg { width: 10px; height: 10px; }

        /* ── Text ── */
        .ty-text {
            font-size: 15px; line-height: 1.65; color: #333;
            margin: 0;
        }

        /* ── Photos ── */
        .ty-photos {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 14px;
        }
        .ty-photo-thumb {
            width: 80px; height: 80px;
            border-radius: 10px;
            object-fit: cover;
            cursor: pointer;
            border: 2px solid #f0f0f0;
            transition: transform 0.2s, border-color 0.2s;
        }
        .ty-photo-thumb:hover { transform: scale(1.06); border-color: #FF6000; }

        /* ── Load More ── */
        .ty-footer {
            margin-top: 30px;
            text-align: center;
        }
        .ty-load-more {
            background: #fff;
            border: 1.5px solid #FF6000;
            color: #FF6000;
            padding: 12px 32px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .ty-load-more:hover {
            background: #FF6000;
            color: #fff;
            box-shadow: 0 6px 20px rgba(255, 96, 0, 0.2);
        }
        .ty-load-more.hidden { display: none; }

        /* ── Lightbox ── */
        .ty-lightbox {
            display: none;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.85);
            z-index: 99999;
            align-items: center; justify-content: center;
            flex-direction: column;
            gap: 12px;
            backdrop-filter: blur(10px);
        }
        .ty-lightbox.open { display: flex; }
        .ty-lightbox img {
            max-width: 90vw; max-height: 80vh;
            border-radius: 16px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.5);
            border: 3px solid rgba(255,255,255,0.1);
        }
        .ty-lb-close {
            position: fixed; top: 20px; right: 24px;
            background: rgba(255,255,255,0.15);
            border: none; color: #fff; font-size: 28px;
            width: 44px; height: 44px; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(4px);
            transition: background 0.2s;
        }
        .ty-lb-close:hover { background: rgba(255,255,255,0.3); }
        .ty-lb-nav { display: flex; gap: 12px; }
        .ty-lb-btn {
            background: rgba(255,255,255,0.15); border: none; color: #fff;
            font-size: 22px; padding: 8px 18px; border-radius: 10px;
            cursor: pointer; backdrop-filter: blur(4px);
            transition: background 0.2s;
        }
        .ty-lb-btn:hover { background: rgba(255,255,255,0.3); }

        /* ── Loading ── */
        .ty-loading {
            text-align: center; padding: 60px 20px; color: #aaa;
        }
        .ty-spinner {
            width: 40px; height: 40px; border-radius: 50%;
            border: 3.5px solid #f0f0f0; border-top-color: #FF6000;
            animation: ty-spin 0.9s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
            margin: 0 auto 16px;
        }
        @keyframes ty-spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (min-width: 640px) {
            .ty-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 520px) {
            .ty-score-box { width: 100%; justify-content: space-between; }
            .ty-card { padding: 18px; }
            .ty-photo-thumb { width: 65px; height: 65px; }
            .ty-heading { font-size: 19px; }
        }
    `;
    document.head.appendChild(style);

    /* ── Lightbox Logic ── */
    let lbPhotos = [];
    let lbIdx = 0;

    function openLightbox(photos, idx) {
        lbPhotos = photos; lbIdx = idx;
        const lb = document.getElementById('ty-lightbox-global') || ensureLightbox();
        lb.querySelector('.ty-lb-img').src = lbPhotos[lbIdx];
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        document.getElementById('ty-lightbox-global').classList.remove('open');
        document.body.style.overflow = '';
    }
    function lbNext(dir) {
        lbIdx = (lbIdx + dir + lbPhotos.length) % lbPhotos.length;
        document.getElementById('ty-lightbox-global').querySelector('.ty-lb-img').src = lbPhotos[lbIdx];
    }

    function ensureLightbox() {
        let lb = document.getElementById('ty-lightbox-global');
        if (lb) return lb;
        lb = document.createElement('div');
        lb.id = 'ty-lightbox-global';
        lb.className = 'ty-lightbox';
        lb.innerHTML = `
            <button class="ty-lb-close">✕</button>
            <img class="ty-lb-img" src="" alt="Yorum Fotoğrafı" />
            <div class="ty-lb-nav">
                <button class="ty-lb-btn" id="ty-lb-prev">&#8592;</button>
                <button class="ty-lb-btn" id="ty-lb-next">&#8594;</button>
            </div>
        `;
        document.body.appendChild(lb);
        lb.querySelector('.ty-lb-close').onclick = closeLightbox;
        lb.onclick = e => { if (e.target === lb) closeLightbox(); };
        document.getElementById('ty-lb-prev').onclick = e => { e.stopPropagation(); lbNext(-1); };
        document.getElementById('ty-lb-next').onclick = e => { e.stopPropagation(); lbNext(1); };
        document.addEventListener('keydown', e => {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') lbNext(1);
            if (e.key === 'ArrowLeft') lbNext(-1);
        });
        return lb;
    }

    /* ── Helpers ── */
    const COLORS = 5;
    function avatarColor(name) { return 'c' + (Math.abs(name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % COLORS); }
    function initial(name) { return (name || '?')[0].toUpperCase(); }
    function stars(n) {
        n = Math.round(parseFloat(n) || 0);
        return '★'.repeat(Math.max(0, Math.min(5, n))) + '☆'.repeat(Math.max(0, 5 - n));
    }

    /* ── Auto Barcode ── */
    function autoDetectBarcode(el) {
        const explicit = el.getAttribute('data-barcode');
        if (explicit) return explicit;

        const jsVars = [
            () => window.product?.barkod,
            () => window.product?.barcode,
            () => window.UrunDetay?.Barkod,
            () => window.UrunDetay?.barcode,
            () => window.bcData?.barcode,
            () => window.ViewData?.Product?.Barcode,
            // Ticimax dataLayer check
            () => {
                const dl = window.dataLayer || [];
                const item = dl.find(d => d.ecommerce?.items?.[0]?.item_barcode)?.ecommerce.items[0];
                return item?.item_barcode || item?.item_id;
            }
        ];
        for (const getter of jsVars) {
            try {
                const val = getter();
                // Match numeric (8-14) or alphanumeric (like TYB...)
                if (val && /^[A-Z0-9-]{6,20}$/i.test(String(val).trim())) return String(val).trim();
            } catch (e) { }
        }

        for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
            try {
                const json = JSON.parse(script.textContent);
                const candidates = Array.isArray(json) ? json : [json, ...(json['@graph'] || [])];
                for (const obj of candidates) {
                    const bc = obj.gtin13 || obj.gtin8 || obj.gtin || obj.sku || obj.productID || obj['product:retailer_item_id'];
                    if (bc && /^\d{8,14}$/.test(String(bc).replace(/-/g, ''))) return String(bc).replace(/-/g, '');
                }
            } catch (e) { }
        }

        const meta = document.querySelector('meta[property="product:retailer_item_id"], meta[name="barcode"], meta[itemprop="gtin13"]');
        if (meta) return meta.getAttribute('content');

        return null;
    }

    class TrendyolWidget {
        constructor(el) {
            this.el = el;
            this.contentId = el.getAttribute('data-content-id');
            this.barcode = this.contentId ? null : autoDetectBarcode(el);
            this.apiUrl = el.getAttribute('data-api-url') || 'https://ty-hxv3.onrender.com/api/reviews';
            this.allReviews = [];
            this.filteredReviews = [];
            this.pageSize = 10;
            this.currentPage = 1;
            this.activeFilter = 0; // 0 = All, 5, 4, 3, 2, 1
            this.init();
        }

        async init() {
            ensureLightbox();
            if (!this.barcode && !this.contentId) {
                this.el.innerHTML = `<div class="ty-widget" style="text-align:center;padding:40px;color:#bbb;font-size:14px;">Widget: ürün barkodu veya content ID tespit edilemedi.</div>`;
                return;
            }

            this.el.innerHTML = `<div class="ty-widget"><div class="ty-loading"><div class="ty-spinner"></div>Trendyol yorumları hazırlanıyor…</div></div>`;
            try {
                const queryParam = this.contentId 
                    ? `contentId=${encodeURIComponent(this.contentId)}`
                    : `barcode=${encodeURIComponent(this.barcode)}`;
                const res = await fetch(`${this.apiUrl}?${queryParam}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || data.error || 'API Hatası');
                }

                this.overallRating = data.overallRating;
                this.totalReviewsCount = data.totalReviews;
                this.allReviews = data.reviews || [];
                this.filteredReviews = [...this.allReviews];

                if (this.allReviews.length > 0) {
                    this.renderStructure();
                    this.updateList();
                } else {
                    this.el.innerHTML = `<div class="ty-widget" style="text-align:center;padding:40px;color:#aaa;">Henüz bu ürüne ait yorum bulunmuyor.</div>`;
                }
            } catch (e) {
                console.error('[Trendyol Widget Error]:', e);
                this.el.innerHTML = `
                    <div class="ty-widget" style="text-align:center;padding:40px;color:#e53935;border:1px solid #ffcdd2;border-radius:12px;background:#ffebee;">
                        <div style="font-weight:bold;margin-bottom:8px;">Hata Oluştu</div>
                        <div style="font-size:14px;color:#c62828;">${e.message}</div>
                        <div style="font-size:12px;color:#ef9a9a;margin-top:10px;">${this.contentId ? 'Content ID: ' + this.contentId : 'Barkod: ' + this.barcode}</div>
                    </div>`;
            }
        }

        renderStructure() {
            this.el.innerHTML = `
                <div class="ty-widget">
                    <div class="ty-header">
                        <div class="ty-header-left">
                            <span class="ty-logo">Trendyol</span>
                            <h3 class="ty-heading">Müşteri Yorumları</h3>
                        </div>
                        <div class="ty-score-box">
                            <div class="ty-score-num">${parseFloat(this.overallRating).toFixed(1)}</div>
                            <div class="ty-score-right">
                                <div class="ty-score-stars">${stars(this.overallRating)}</div>
                                <div class="ty-score-count">${this.totalReviewsCount.toLocaleString('tr-TR')} değerlendirme</div>
                            </div>
                        </div>
                    </div>

                    <div class="ty-filters">
                        <button class="ty-filter-btn active" data-stars="0">Tümü</button>
                        <button class="ty-filter-btn" data-stars="5"><span class="ty-filter-stars">★</span>5</button>
                        <button class="ty-filter-btn" data-stars="4"><span class="ty-filter-stars">★</span>4</button>
                        <button class="ty-filter-btn" data-stars="3"><span class="ty-filter-stars">★</span>3</button>
                        <button class="ty-filter-btn" data-stars="2"><span class="ty-filter-stars">★</span>2</button>
                        <button class="ty-filter-btn" data-stars="1"><span class="ty-filter-stars">★</span>1</button>
                    </div>

                    <div class="ty-grid"></div>

                    <div class="ty-footer">
                        <button class="ty-load-more">Daha Fazla Göster</button>
                    </div>
                </div>
            `;

            // Bind events
            this.el.querySelectorAll('.ty-filter-btn').forEach(btn => {
                btn.onclick = () => {
                    this.el.querySelectorAll('.ty-filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.activeFilter = parseInt(btn.dataset.stars);
                    this.currentPage = 1;
                    this.applyFilter();
                };
            });

            this.el.querySelector('.ty-load-more').onclick = () => {
                this.currentPage++;
                this.updateList();
            };
        }

        applyFilter() {
            if (this.activeFilter === 0) {
                this.filteredReviews = [...this.allReviews];
            } else {
                this.filteredReviews = this.allReviews.filter(r => Math.round(r.rating) === this.activeFilter);
            }
            this.el.querySelector('.ty-grid').innerHTML = '';
            this.updateList();
        }

        updateList() {
            const grid = this.el.querySelector('.ty-grid');
            const loadMoreBtn = this.el.querySelector('.ty-load-more');

            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            const slice = this.filteredReviews.slice(start, end);

            if (slice.length === 0 && this.currentPage === 1) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#999;">Bu puan türünde henüz yorum bulunmuyor.</div>`;
                loadMoreBtn.classList.add('hidden');
                return;
            }

            slice.forEach((r, idx) => {
                const card = document.createElement('div');
                card.className = 'ty-card visible';

                const photos = r.photos || [];
                const photoHTML = photos.length > 0 ? `
                    <div class="ty-photos">
                        ${photos.map((p, pi) => `<img class="ty-photo-thumb" src="${p}" loading="lazy" data-ri="${this.allReviews.indexOf(r)}" data-pi="${pi}" />`).join('')}
                    </div>` : '';

                card.innerHTML = `
                    <div class="ty-card-header">
                        <div class="ty-user">
                            <div class="ty-avatar ${avatarColor(r.author)}">${initial(r.author)}</div>
                            <div>
                                <div class="ty-name">${r.author}</div>
                                <div class="ty-stars-sm">${stars(r.rating)}</div>
                            </div>
                        </div>
                        <div class="ty-meta">
                            <div class="ty-date">${r.date}</div>
                            ${r.verified ? `<div class="ty-badge"><svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#1aa05b"/><path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg>Doğrulanmış</div>` : ''}
                        </div>
                    </div>
                    <p class="ty-text">${r.text}</p>
                    ${photoHTML}
                `;
                grid.appendChild(card);
            });

            // Bind photo clicks in new cards
            grid.querySelectorAll('.ty-photo-thumb').forEach(img => {
                if (img.onclick) return;
                img.onclick = () => {
                    const ri = parseInt(img.dataset.ri);
                    const pi = parseInt(img.dataset.pi);
                    openLightbox(this.allReviews[ri].photos, pi);
                };
            });

            if (end >= this.filteredReviews.length) {
                loadMoreBtn.classList.add('hidden');
            } else {
                loadMoreBtn.classList.remove('hidden');
            }
        }
    }

    function init() { document.querySelectorAll('[data-ty-widget="reviews"]').forEach(el => new TrendyolWidget(el)); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
