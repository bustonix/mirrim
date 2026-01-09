import Parser from 'rss-parser';

const parser = new Parser();

async function checkAMI() {
    console.log("Checking AMI RSS...");
    const url = 'https://ami.mr/fr/rssfeed/'; // Check FR feed
    // Note: AMI might also need headers or return duplicates
    try {
        const feed = await parser.parseURL(url);
        if (feed.items.length > 0) {
            console.log("First Item Title:", feed.items[0].title);
            console.log("Enclosure:", feed.items[0].enclosure);
            console.log("Content Snippet:", feed.items[0].contentSnippet?.substring(0, 100));
            console.log("Content:", feed.items[0].content?.substring(0, 200));
        } else {
            console.log("No items found.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

checkAMI();
