/**
 * Image Extractor Module
 * Extracts article images from news source pages
 * 
 * Strategy (priority order):
 * 1. og:image meta tag (if not a default/placeholder)
 * 2. wp-content/uploads links for WordPress sites
 * 3. First article image tag
 */

import * as cheerio from 'cheerio';

// Patterns that indicate a default/placeholder image
const INVALID_IMAGE_PATTERNS = [
    'default-thumb',
    'placeholder',
    'logo',
    'avatar',
    'icon',
    'banner',
    'no-image',
    'missing',
];

// Valid image extensions
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;

interface ExtractionResult {
    imageUrl: string | null;
    method: 'og:image' | 'twitter:image' | 'wp-content' | 'article-img' | 'none';
}

/**
 * Validate if a URL is a valid article image
 */
/**
 * Validate if a URL is a valid article image
 */
function isValidImageUrl(url: string | undefined | null): boolean {
    if (!url || url.length < 10) return false;

    // Check for invalid patterns
    const lowerUrl = url.toLowerCase();
    for (const pattern of INVALID_IMAGE_PATTERNS) {
        if (lowerUrl.includes(pattern)) return false;
    }

    // Must have image extension or be from known image CDNs
    if (!IMAGE_EXTENSIONS.test(url)) {
        // Allow some CDN URLs without extensions
        if (!url.includes('cloudinary.com') &&
            !url.includes('wp-content/uploads') &&
            !url.includes('googleusercontent.com')) {
            return false;
        }
    }

    return true;
}

/**
 * Extract article image from a page URL
 * Uses a robust fallback strategy
 */
export async function extractArticleImage(articleUrl: string): Promise<ExtractionResult> {
    const result: ExtractionResult = {
        imageUrl: null,
        method: 'none'
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(articleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6',
            },
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            console.log(`[ImageExtractor] HTTP ${response.status} for ${articleUrl}`);
            return result;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // ============================================================
        // PLATFORM SPECIFIC LOGIC (Based on browser inspection)
        // ============================================================

        // --- CRIDEM ---
        if (articleUrl.includes('cridem.org')) {
            // Priority 1: Main article photo (img.focus-photo which is inside div#article)
            const focusPhoto = $('img.focus-photo').attr('src');
            if (focusPhoto) {
                result.imageUrl = focusPhoto.startsWith('http') ? focusPhoto : `http://cridem.org/${focusPhoto}`;
                result.method = 'article-img';
                return result;
            }
        }

        // --- AMI (ami.mr) ---
        if (articleUrl.includes('ami.mr')) {
            // Priority 1: High res image from parent anchor of thumbnail
            const thumbnailLink = $('a.post-thumbnail').attr('href');
            if (isValidImageUrl(thumbnailLink)) {
                result.imageUrl = thumbnailLink!;
                result.method = 'article-img';
                return result;
            }

            // Priority 2: Thumbnail image (check data-src first for lazy load)
            const thumbImg = $('a.post-thumbnail img');
            const thumbSrc = thumbImg.attr('data-src') || thumbImg.attr('src');
            if (isValidImageUrl(thumbSrc)) {
                result.imageUrl = thumbSrc!;
                result.method = 'article-img';
                return result;
            }
        }

        // --- LE CALAME ---
        if (articleUrl.includes('lecalame.info')) {
            // Selector: .field-items .field-item img
            // Often inside .field-name-body or main content
            const mainImg = $('.field-item img, .node-content img').first();
            const src = mainImg.attr('src');
            if (isValidImageUrl(src)) {
                result.imageUrl = src!;
                result.method = 'article-img';
                return result;
            }
        }

        // --- KASSATAYA ---
        if (articleUrl.includes('kassataya.com')) {
            // Selector: .single-featured-image img
            const mainImg = $('.single-featured-image img').first();
            const src = mainImg.attr('src');
            if (isValidImageUrl(src)) {
                result.imageUrl = src!;
                result.method = 'article-img';
                return result;
            }
        }

        // --- ESSAHRAA (FR & AR) ---
        if (articleUrl.includes('essahraa.net')) {
            // Selector: .field-name-field-image img
            const mainImg = $('.field-name-field-image img, .field-item span.caption img').first();
            const src = mainImg.attr('src');
            if (isValidImageUrl(src)) {
                result.imageUrl = src!;
                result.method = 'article-img';
                return result;
            }
        }

        // --- ALAFKHAR (AR) ---
        if (articleUrl.includes('alakhbar.info')) {
            // Selector: .field-name-field-image img (Drupal)
            const mainImg = $('.field-name-field-image img, .field-type-image img').first();
            const src = mainImg.attr('src');
            if (isValidImageUrl(src)) {
                result.imageUrl = src!;
                result.method = 'article-img';
                return result;
            }
        }

        // --- SAHARA MEDIAS (AR) ---
        if (articleUrl.includes('saharamedias.net')) {
            // WordPress: .featured img (found in inspection), .featured-image img
            const mainImg = $('.featured img, .featured-image img, .post-thumbnail img, .entry-content img').first();
            const src = mainImg.attr('src') || mainImg.attr('data-src');
            if (isValidImageUrl(src)) {
                result.imageUrl = src!;
                result.method = 'article-img';
                return result;
            }
        }

        // ============================================================
        // GENERIC FALLBACKS
        // ============================================================

        // === PRIORITY 1: OpenGraph Image (High Quality) ===
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (isValidImageUrl(ogImage)) {
            result.imageUrl = ogImage!;
            result.method = 'og:image';
            return result;
        }

        // === PRIORITY 2: Twitter Image ===
        const twitterImage = $('meta[name="twitter:image"]').attr('content')
            || $('meta[property="twitter:image"]').attr('content');
        if (isValidImageUrl(twitterImage)) {
            result.imageUrl = twitterImage!;
            result.method = 'twitter:image';
            return result;
        }

        // === PRIORITY 3: Content Heuristics ===
        const contentSelectors = [
            'article img',
            'main img',
            '.post-content img',
            '.entry-content img',
            '#article img'
        ];

        for (const selector of contentSelectors) {
            const img = $(selector).first();
            const src = img.attr('src') || img.attr('data-src');

            // Resolve relative URLs if needed, though most modern setups use absolute
            if (isValidImageUrl(src)) {
                // Basic relative URL handling
                if (src && !src.startsWith('http')) {
                    const urlObj = new URL(articleUrl);
                    result.imageUrl = new URL(src, urlObj.origin).toString();
                } else {
                    result.imageUrl = src!;
                }
                result.method = 'article-img';
                return result;
            }
        }

    } catch (err) {
        if ((err as Error).name === 'AbortError') {
            console.log(`[ImageExtractor] Timeout for ${articleUrl}`);
        } else {
            console.log(`[ImageExtractor] Error for ${articleUrl}: ${(err as Error).message}`);
        }
    }

    return result;
}

/**
 * Extract images for multiple articles with rate limiting
 */
export async function extractImagesForArticles(
    articles: { url: string; id?: string }[]
): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();

    for (const article of articles) {
        // Rate limiting: wait 300ms between requests
        await new Promise(resolve => setTimeout(resolve, 300));

        const extraction = await extractArticleImage(article.url);
        results.set(article.url, extraction.imageUrl);

        if (extraction.imageUrl) {
            console.log(`[ImageExtractor] ✅ ${extraction.method}: ${article.url}`);
        } else {
            console.log(`[ImageExtractor] ❌ No image: ${article.url}`);
        }
    }

    return results;
}
