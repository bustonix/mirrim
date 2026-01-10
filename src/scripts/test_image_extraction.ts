/**
 * Script de test pour l'extraction automatique d'images
 * Stratégie:
 * 1. og:image / twitter:image dans <head>
 * 2. Fallback: premier lien <a href="..."> contenant /wp-content/uploads/ + .jpg/.png/.webp
 */

import * as cheerio from 'cheerio';

const TEST_URLS = [
    'https://ami.mr/fr/archives/287002',
    'https://ami.mr/fr/archives/287000',
    'https://ami.mr/fr/archives/286998',
    'https://ami.mr/ar/archives/287001',
    'https://ami.mr/ar/archives/286999',
];

interface ExtractionResult {
    url: string;
    method: 'og:image' | 'twitter:image' | 'wp-content-link' | 'img-tag' | 'none';
    imageUrl: string | null;
    title: string | null;
}

async function extractImageFromPage(pageUrl: string): Promise<ExtractionResult> {
    const result: ExtractionResult = {
        url: pageUrl,
        method: 'none',
        imageUrl: null,
        title: null
    };

    try {
        const response = await fetch(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            console.log(`❌ ${pageUrl}: HTTP ${response.status}`);
            return result;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Get title
        result.title = $('title').text().trim().slice(0, 60) + '...';

        // Strategy 1: og:image
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage && ogImage.length > 10) {
            result.method = 'og:image';
            result.imageUrl = ogImage;
            return result;
        }

        // Strategy 2: twitter:image
        const twitterImage = $('meta[name="twitter:image"]').attr('content');
        if (twitterImage && twitterImage.length > 10) {
            result.method = 'twitter:image';
            result.imageUrl = twitterImage;
            return result;
        }

        // Strategy 3: wp-content/uploads link
        const wpLinks = $('a[href*="/wp-content/uploads/"]').toArray();
        for (const link of wpLinks) {
            const href = $(link).attr('href');
            if (href && /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(href)) {
                result.method = 'wp-content-link';
                result.imageUrl = href;
                return result;
            }
        }

        // Strategy 4: First article image
        const articleImg = $('article img, .entry-content img, .post-content img').first().attr('src');
        if (articleImg && articleImg.length > 10) {
            result.method = 'img-tag';
            result.imageUrl = articleImg;
            return result;
        }

    } catch (err) {
        console.log(`❌ ${pageUrl}: ${err}`);
    }

    return result;
}

async function runTests() {
    console.log('🔍 Test d\'extraction d\'images AMI\n');
    console.log('='.repeat(80));

    for (const url of TEST_URLS) {
        const result = await extractImageFromPage(url);

        console.log(`\n📄 ${result.title || 'Unknown'}`);
        console.log(`   URL: ${url}`);
        console.log(`   Method: ${result.method}`);
        console.log(`   Image: ${result.imageUrl || 'NOT FOUND'}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test terminé');
}

runTests();
