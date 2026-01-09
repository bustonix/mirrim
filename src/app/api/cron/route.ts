import { NextResponse } from 'next/server';
import { fetchNews } from '@/lib/scraper';
import { saveArticle } from '@/lib/db';

// This route triggers the scraping process and saves to DB
// Secure this in production! (e.g. check for a CRON_SECRET header)
export async function GET() {
    try {
        console.log("⏳ Starting scheduled ingestion...");
        const articles = await fetchNews();
        console.log(`📡 Scraped ${articles.length} articles. Saving to DB...`);

        let savedCount = 0;
        for (const article of articles) {
            const saved = await saveArticle(article);
            if (saved) savedCount++;
        }

        console.log(`✅ Successfully saved/updated ${savedCount} articles.`);
        return NextResponse.json({
            success: true,
            scraped: articles.length,
            saved: savedCount
        });
    } catch (error) {
        console.error("❌ Ingestion failed:", error);
        return NextResponse.json({ success: false, error: 'Ingestion failed' }, { status: 500 });
    }
}
