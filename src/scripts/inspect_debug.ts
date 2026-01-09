
import * as cheerio from 'cheerio';

async function inspectAMI() {
    console.log('\n--- INSPECTING AMI ---');
    try {
        const response = await fetch('https://ami.mr/fr');
        const html = await response.text();
        const $ = cheerio.load(html);

        // Check finding news items
        $('.item-inner').each((i, el) => {
            if (i < 3) {
                const title = $(el).find('h2 a').text().trim();
                const link = $(el).find('h2 a').attr('href');
                const imgAttrs = $(el).find('img').attr();
                console.log(`[Item ${i}] Title: ${title}, Link: ${link}`);
                console.log(`   > Image Attrs:`, imgAttrs);
            }
        });
    } catch (e) {
        console.error('AMI Error:', e);
    }
}

async function inspectRMI() {
    console.log('\n--- INSPECTING RMI-INFO ---');
    try {
        // Try with a real-looking User Agent
        const response = await fetch('https://rmi-info.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log('RMI Status:', response.status);
        if (response.status === 200) {
            const html = await response.text();
            console.log('RMI fetched successfully! Length:', html.length);
            // Basic check
            const $ = cheerio.load(html);
            $('article h2').each((i, el) => {
                if (i < 3) console.log('RMI Title:', $(el).text().trim());
            });
        }
    } catch (e) {
        console.error('RMI Error:', e);
    }
}

async function run() {
    await inspectAMI();
    await inspectRMI();
}

run();
