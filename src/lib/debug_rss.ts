import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['enclosure', 'enclosure'],
            ['content:encoded', 'contentEncoded'],
            ['description', 'description']
        ]
    }
});

const URLS = [
    'http://cridem.org/rss.php',
    'https://www.essahraa.net/rss.xml',
    'https://kassataya.com/feed'
];

async function debug() {
    for (const url of URLS) {
        console.log(`\n--- Inspecting ${url} ---`);
        try {
            const feed = await parser.parseURL(url);
            if (feed.items.length > 0) {
                const item = feed.items[0];
                console.log("Title:", item.title);
                console.log("Enclosure:", item.enclosure);
                console.log("Media Content:", item['media:content']); // raw access
                console.log("Custom Media:", item.mediaContent);
                // Log partial content to see if img tags exist
                console.log("Content Encoded Start:", item.contentEncoded?.substring(0, 200));
                console.log("Description Start:", item.description?.substring(0, 200));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

debug();
