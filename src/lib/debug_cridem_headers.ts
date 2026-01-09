import Parser from 'rss-parser';

const parser = new Parser();

async function checkCridemWithHeaders() {
    console.log("Fetching Cridem RSS with Headers...");
    try {
        const response = await fetch('http://cridem.org/rss.php', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`Failed: ${response.status}`);
            return;
        }

        const xmlData = await response.text();
        console.log(`Length: ${xmlData.length}`);

        if (xmlData.length < 100) {
            console.log("Response too short:", xmlData);
            return;
        }

        const feed = await parser.parseString(xmlData);
        console.log(`Found ${feed.items.length} items.`);
        if (feed.items.length > 0) {
            console.log("First item:", feed.items[0]);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

checkCridemWithHeaders();
