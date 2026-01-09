import { supabaseAdmin, supabase } from './supabase';
import { Article } from './scraper';

// Use Admin client to bypass RLS during ingestion
export async function saveArticle(article: Article) {
    const { data, error } = await supabaseAdmin
        .from('articles')
        .upsert({
            link: article.link,
            title: article.title,
            source: article.source,
            language: article.language,
            excerpt: article.excerpt,
            image_url: article.imageUrl,
            category: article.category,
            pub_date: article.pubDate
        }, { onConflict: 'link' })
        .select();

    if (error) {
        console.error('Error saving article:', error);
        return null;
    }
    return data;
}

// Use standard client for fetching (respects RLS)
export async function getArticles(lang: string = 'fr', limit: number = 50) {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('language', lang)
        .order('pub_date', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }

    // Map back to our internal Article interface if needed, or return as is
    return data.map((row: any) => ({
        title: row.title,
        link: row.link,
        source: row.source,
        language: row.language,
        pubDate: row.pub_date,
        excerpt: row.excerpt,
        imageUrl: row.image_url,
        category: row.category
    }));
}
