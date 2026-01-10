import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { extractArticleImage } from './imageExtractor';

export interface Article {
    title: string;
    link: string;
    source: string;
    language: 'fr' | 'ar';
    pubDate: string;
    excerpt?: string;
    imageUrl?: string;
    category?: string;
}

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['enclosure', 'enclosure'],
            ['content:encoded', 'contentEncoded'],
            ['content', 'content'],
            ['description', 'description']
        ]
    }
});

// Helper to extract image from various RSS fields
function extractImage(item: any): string | undefined {
    // 1. Check Enclosure (Standard RSS)
    if (item.enclosure && item.enclosure.url) {
        return item.enclosure.url;
    }

    // 2. Check Media Content (Yahoo/Wordpress)
    if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
        return item.mediaContent.$.url;
    }

    // 3. Check Media Content (Direct Property)
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
        return item['media:content'].$.url;
    }

    // 4. Regex for first <img> tag in content
    const imgRegex = /<img[^>]+src="([^">]+)"/i;

    if (item.contentEncoded) {
        const match = item.contentEncoded.match(imgRegex);
        if (match) return match[1];
    }

    if (item.content) {
        const match = item.content.match(imgRegex);
        if (match) return match[1];
    }

    if (item.description) {
        const match = item.description.match(imgRegex);
        if (match) return match[1];
    }

    return undefined;
}

// --- Configuration ---
const SOURCES = [
    {
        name: 'Cridem',
        displayNameAr: 'كريدم',
        url: 'http://cridem.org/rss.php',
        type: 'rss',
        language: 'fr',
        logoUrl: '/logos/cridem.png'
    },
    {
        name: 'Essahraa',
        displayNameAr: 'الصحراء',
        url: 'https://essahraa.net/fr/rss',
        type: 'rss',
        language: 'fr',
        logoUrl: '/logos/essahraa.png'
    },
    {
        name: 'الصحراء',
        displayNameAr: 'الصحراء',
        url: 'https://www.essahraa.net/rss.xml',
        type: 'rss',
        language: 'ar',
        logoUrl: '/logos/essahraa.png'
    },
    {
        name: 'Le Calame',
        displayNameAr: 'القلم',
        url: 'http://lecalame.info/?q=rss.xml',
        type: 'rss',
        language: 'fr',
        logoUrl: '/logos/lecalame.png'
    },
    {
        name: 'Kassataya',
        displayNameAr: 'كاساتايا',
        url: 'https://kassataya.com/feed',
        type: 'rss',
        language: 'fr',
        logoUrl: '/logos/kassataya.png'
    },
    {
        name: 'Sahara Medias',
        displayNameAr: 'صحراء ميدياس',
        url: 'https://saharamedias.net/fr/feed',
        type: 'rss',
        language: 'fr',
        logoUrl: '/logos/saharamedias.png'
    },
    {
        name: 'الأخبار',
        displayNameAr: 'الأخبار',
        url: 'https://alakhbar.info/?q=rss.xml',
        type: 'rss',
        language: 'ar',
        logoUrl: '/logos/alakhbar.png'
    },
    {
        name: 'صحراء ميدياس',
        displayNameAr: 'صحراء ميدياس',
        url: 'https://www.saharamedias.net/feed',
        type: 'rss',
        language: 'ar',
        logoUrl: '/logos/saharamedias.png'
    }
];

// --- Helpers ---

// "The Hack": Simple heuristic to check if two titles are "basically the same"
function isDuplicate(article: Article, existingArticles: Article[]): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newTitle = normalize(article.title);

    return existingArticles.some(existing => {
        const existingTitle = normalize(existing.title);
        // If titles are 80% similar or one includes the other
        return newTitle.includes(existingTitle) || existingTitle.includes(newTitle);
    });
}

async function fetchHtmlParams(url: string) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        return $;
    } catch (e) {
        console.error(`Failed to fetch HTML for ${url}`, e);
        return null;
    }
}

// --- Main Scraper Function ---

// --- Custom Scrapers ---

async function scrapeAMI(language: 'fr' | 'ar'): Promise<Article[]> {
    const url = language === 'fr' ? 'https://ami.mr/fr' : 'https://ami.mr/ar';
    const $ = await fetchHtmlParams(url);
    if (!$) return [];

    const articles: Article[] = [];
    const articleLinks: string[] = [];

    // AMI uses .item-inner containing h2 > a
    $('.item-inner').each((i, el) => {
        if (i > 10) return; // Limit to 10 latest
        const titleEl = $(el).find('h2 a');
        if (titleEl.length) {
            const link = titleEl.attr('href') || '#';
            articleLinks.push(link);
            articles.push({
                title: titleEl.text().trim(),
                link: link,
                source: 'AMI',
                language: language,
                pubDate: new Date().toISOString(),
                excerpt: 'Agence Mauritanienne d\'Information - Officiel',
                imageUrl: undefined // Will be populated below
            });
        }
    });

    // Extract images for each article (with rate limiting)
    for (let i = 0; i < articles.length; i++) {
        try {
            const extraction = await extractArticleImage(articles[i].link);
            if (extraction.imageUrl) {
                articles[i].imageUrl = extraction.imageUrl;
                console.log(`[AMI] ✅ Image extracted (${extraction.method}): ${articles[i].title.slice(0, 40)}...`);
            } else {
                console.log(`[AMI] ❌ No image found: ${articles[i].title.slice(0, 40)}...`);
            }
        } catch (err) {
            console.log(`[AMI] Error extracting image for ${articles[i].link}`);
        }
        // Rate limiting between requests
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    return articles;
}

// --- Main Scraper Function ---

export async function fetchNews(): Promise<Article[]> {
    let allArticles: Article[] = [];

    // 1. Fetch Standard RSS Sources
    for (const source of SOURCES) {
        try {
            if (source.type === 'rss') {
                let xmlData = '';

                // Special handling for legacy sources (encoding/headers)
                if (source.name.includes('Cridem')) {
                    const response = await fetch(source.url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });

                    if (!response.ok) {
                        console.error(`Failed to fetch RSS for ${source.name}: ${response.status}`);
                        continue;
                    }

                    // Decode ISO-8859-1 manually
                    const buffer = await response.arrayBuffer();
                    const decoder = new TextDecoder('iso-8859-1');
                    xmlData = decoder.decode(buffer);
                } else {
                    // Standard Sources
                    const response = await fetch(source.url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    if (!response.ok) {
                        console.error(`Failed to fetch RSS for ${source.name}: ${response.status}`);
                        continue;
                    }
                    xmlData = await response.text();
                }

                if (!xmlData || xmlData.length < 50) continue;

                const feed = await parser.parseString(xmlData);

                const sourceArticles = feed.items.map(item => ({
                    title: item.title || 'Sans titre',
                    link: item.link || '#',
                    source: source.name,
                    language: source.language as 'fr' | 'ar',
                    pubDate: item.pubDate || new Date().toISOString(),
                    excerpt: item.contentSnippet?.slice(0, 150) + '...' || '',
                    imageUrl: extractImage(item) || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'
                }));

                for (const article of sourceArticles) {
                    // Apply Deduplication Logic
                    if (!isDuplicate(article, allArticles)) {
                        allArticles.push(article);
                    }
                }
            }

        } catch (error) {
            console.error(`Error fetching ${source.name}:`, error);
        }
    }

    // 2. Fetch Custom Scrapers (AMI)
    try {
        const amiFr = await scrapeAMI('fr');
        const amiAr = await scrapeAMI('ar');
        allArticles = [...allArticles, ...amiFr, ...amiAr];
    } catch (e) {
        console.error("Failed to scrape AMI", e);
    }

    // Sort by date (newest first)
    return allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
