import Parser from 'rss-parser';

const parser = new Parser();

async function checkFix() {
    console.log("Testing Cridem Manual Fix...");
    const url = 'http://cridem.org/rss.php';

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error("Fetch failed:", response.status);
            return;
        }

        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1');
        const xmlData = decoder.decode(buffer);

        console.log(`Decoded Length: ${xmlData.length}`);
        console.log("Snippet:", xmlData.substring(0, 200));

        if (xmlData.length < 50) {
            console.log("Data too short.");
            return;
        }

        // Try parsing
        try {
            const feed = await parser.parseString(xmlData);
            console.log(`Success! Parsed ${feed.items.length} items.`);
            if (feed.items.length > 0) {
                console.log("Title:", feed.items[0].title);
            }
        } catch (parseError) {
            console.error("Parse Error:", parseError);
        }

    } catch (e) {
        console.error("Network Error:", e);
    }
}

checkFix();
