import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { articleIds } = await request.json();

        if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'articleIds array is required' },
                { status: 400 }
            );
        }

        // 1. Get image URLs for these articles to delete from storage
        const { data: articles, error: fetchError } = await supabaseAdmin
            .from('articles')
            .select('image_url')
            .in('id', articleIds);

        if (fetchError) {
            console.error('Error fetching articles for bulk delete:', fetchError);
            // Continue to try deleting records even if fetch fails? Better to fail safely.
        }

        // 2. Delete images from storage
        const filesToDelete: string[] = [];
        articles?.forEach(article => {
            if (article.image_url && article.image_url.includes('supabase')) {
                const filename = article.image_url.split('/').pop();
                if (filename) filesToDelete.push(filename);
            }
        });

        if (filesToDelete.length > 0) {
            await supabaseAdmin.storage
                .from('news-images')
                .remove(filesToDelete);
        }

        // 3. Delete articles from database
        const { error: deleteError } = await supabaseAdmin
            .from('articles')
            .delete()
            .in('id', articleIds);

        if (deleteError) {
            return NextResponse.json(
                { success: false, error: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, count: articleIds.length });
    } catch (err) {
        console.error('Bulk delete error:', err);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
