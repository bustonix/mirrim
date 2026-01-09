import { NextResponse } from 'next/server';
import { getArticles } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'fr';

    try {
        // FAST: Fetch from "Memory" (Supabase) instead of "Live" (Scraping)
        const articles = await getArticles(lang, 50); // Get last 50 articles

        return NextResponse.json({ success: true, count: articles.length, data: articles });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch news from DB' }, { status: 500 });
    }
}
