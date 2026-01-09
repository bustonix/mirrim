
import * as cheerio from 'cheerio';

async function inspect() {
    try {
        const response = await fetch('https://ami.mr/fr');
        const html = await response.text();
        const $ = cheerio.load(html);

        console.log('--- AMI HTML Inspection ---');
        // Try to find common structures
        $('h1, h2, h3').each((i, el) => {
            if (i < 5) {
                const text = $(el).text().trim();
                const link = $(el).find('a').attr('href');
                const parentClass = $(el).parent().attr('class');
                console.log(`[${i}] Tag: ${el.tagName}, Text: ${text.substring(0, 50)}..., Link: ${link}, ParentClass: ${parentClass}`);
            }
        });

        // specific check for images
        $('img').each((i, el) => {
            if (i < 3) {
                console.log(`[IMG ${i}] Src: ${$(el).attr('src')}, ParentClass: ${$(el).parent().attr('class')}`);
            }
        });

    } catch (e) {
        console.error(e);
    }
}

inspect();
