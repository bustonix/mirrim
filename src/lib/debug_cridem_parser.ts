import Parser from 'rss-parser';

const parser = new Parser({
    requestOptions: {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        }
    }
});

async function check() {
    console.log("Parsing Cridem with rss-parser + headers...");
    try {
        const feed = await parser.parseURL('http://cridem.org/rss.php');
        console.log(`Success! Found ${feed.items.length} items.`);
        if (feed.items.length > 0) {
            console.log("Sample:", feed.items[0].title);
        }
    } catch (e) {
        console.error("Parser Error:", e);
    }
}

check();
