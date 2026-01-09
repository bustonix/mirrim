import * as cheerio from 'cheerio';

async function checkCridem() {
    console.log("Fetching Cridem RSS...");
    try {
        const res = await fetch('http://cridem.org/rss.php');
        const text = await res.text();
        console.log("Length:", text.length);
        console.log("First 500 chars:", text.substring(0, 500));

        // Check for images in the raw XML
        const hasEnclosure = text.includes('<enclosure');
        const hasMedia = text.includes('media:');
        const hasImgTags = text.includes('<img');

        console.log({ hasEnclosure, hasMedia, hasImgTags });

        // Try parsing manually
        const $ = cheerio.load(text, { xmlMode: true });
        $('item').each((i, el) => {
            if (i > 2) return;
            const title = $(el).find('title').text();
            const description = $(el).find('description').text();
            console.log(`\nTitle: ${title}`);
            console.log(`Description Preview: ${description.substring(0, 100)}`);
            // Check for img in description
            const descHtml = cheerio.load(description);
            const img = descHtml('img').attr('src');
            console.log(`Extracted Image: ${img}`);
        });

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

checkCridem();
