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
function isValidImageUrl(url: string | undefined | null): boolean {
    if (!url || url.length < 20) return false;

    // Check for invalid patterns
    const lowerUrl = url.toLowerCase();
    for (const pattern of INVALID_IMAGE_PATTERNS) {
        if (lowerUrl.includes(pattern)) return false;
    }

    // Must have image extension or be from known image CDNs
    if (!IMAGE_EXTENSIONS.test(url)) {
        // Allow some CDN URLs without extensions
        if (!url.includes('cloudinary.com') && !url.includes('wp-content/uploads')) {
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
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(articleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7',
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

        // === PRIORITY 1: WordPress Featured Image (Kassataya, etc.) ===
        const featuredImageSelectors = [
            'figure.wp-block-post-featured-image img',
            'figure.post-thumbnail img',
            'div.post-thumbnail img',
            '.featured-image img',
            '.post-featured-image img',
        ];

        for (const selector of featuredImageSelectors) {
            const img = $(selector).first();
            const src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src');
            if (isValidImageUrl(src)) {
                result.imageUrl = src!;
                result.method = 'article-img';
                console.log(`[ImageExtractor] Found via featured-image: ${selector}`);
                return result;
            }
        }

        // === PRIORITY 2: wp-content/uploads link (WordPress sites) ===
        const wpLinks = $('a[href*="/wp-content/uploads/"]').toArray();
        for (const link of wpLinks) {
            const href = $(link).attr('href');
            if (href && IMAGE_EXTENSIONS.test(href) && isValidImageUrl(href)) {
                result.imageUrl = href;
                result.method = 'wp-content';
                return result;
            }
        }

        // === PRIORITY 3: og:image meta tag (fallback) ===
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (isValidImageUrl(ogImage)) {
            result.imageUrl = ogImage!;
            result.method = 'og:image';
            return result;
        }

        // Strategy 2: twitter:image meta tag
        const twitterImage = $('meta[name="twitter:image"]').attr('content')
            || $('meta[property="twitter:image"]').attr('content');
        if (isValidImageUrl(twitterImage)) {
            result.imageUrl = twitterImage!;
            result.method = 'twitter:image';
            return result;
        }

        // === PRIORITY 5: First image in article content ===
        const articleSelectors = [
            '.post-thumbnail img',
            'article img',
            '.entry-content img',
            '.post-content img',
            '.article-content img',
            '.content img',
            'main img',
        ];

        for (const selector of articleSelectors) {
            const img = $(selector).first();
            const src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src');
            if (isValidImageUrl(src)) {
                result.imageUrl = src!;
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
