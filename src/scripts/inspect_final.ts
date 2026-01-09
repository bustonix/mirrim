
import * as cheerio from 'cheerio';

async function inspectAMI() {
    console.log('\n--- INSPECTING AMI STRUCTURE ---');
    try {
        const response = await fetch('https://ami.mr/fr');
        const html = await response.text();
        const $ = cheerio.load(html);

        // Find the first main news item container
        // We look for elements that contain both an image and an H2
        $('div').each((i, el) => {
            if (i > 50) return; // limit
            const hasH2 = $(el).find('h2').length > 0;
            const hasImg = $(el).find('img').length > 0;
            if (hasH2 && hasImg && $(el).text().length < 500) {
                console.log(`[AMI Candidate ${i}] Class: ${$(el).attr('class')}`);
                console.log(`   > H2: ${$(el).find('h2').text().trim().substring(0, 30)}...`);
                console.log(`   > Img Src: ${$(el).find('img').attr('src')}`);
                console.log(`   > Img Data-Src: ${$(el).find('img').attr('data-src') || $(el).find('img').attr('data-lazy-src')}`);
            }
        });
    } catch (e) { console.error(e); }
}

async function inspectRMI() {
    console.log('\n--- INSPECTING RMI STRUCTURE ---');
    try {
        const response = await fetch('https://rmi-info.com/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Standard WordPress check
        const articles = $('article');
        console.log(`RMI: Found ${articles.length} <article> tags.`);

        articles.each((i, el) => {
            if (i < 3) {
                console.log(`[RMI Article ${i}] Class: ${$(el).attr('class')}`);
                console.log(`   > Title: ${$(el).find('h2, h3, .entry-title').text().trim()}`);
                console.log(`   > Link: ${$(el).find('a').attr('href')}`);
                console.log(`   > Img: ${$(el).find('img').attr('src')}`);
            }
        });

    } catch (e) { console.error(e); }
}

async function run() {
    await inspectAMI();
    await inspectRMI();
}

run();
