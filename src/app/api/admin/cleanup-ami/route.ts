import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * DELETE all AMI articles and their images from Supabase
 * This is used to reset AMI articles before re-scraping with image extraction
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Get all AMI articles with images
        const { data: amiArticles, error: fetchError } = await supabaseAdmin
            .from('articles')
            .select('id, image_url')
            .eq('source', 'AMI');

        if (fetchError) {
            return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
        }

        console.log(`[Cleanup] Found ${amiArticles?.length || 0} AMI articles to delete`);

        // 2. Delete images from Supabase Storage
        const imagesToDelete: string[] = [];
        for (const article of amiArticles || []) {
            if (article.image_url && article.image_url.includes('supabase')) {
                const filename = article.image_url.split('/').pop();
                if (filename) {
                    imagesToDelete.push(filename);
                }
            }
        }

        if (imagesToDelete.length > 0) {
            const { error: storageError } = await supabaseAdmin.storage
                .from('news-images')
                .remove(imagesToDelete);

            if (storageError) {
                console.error('[Cleanup] Storage delete error:', storageError);
            } else {
                console.log(`[Cleanup] Deleted ${imagesToDelete.length} images from storage`);
            }
        }

        // 3. Delete all AMI articles from database
        const { error: deleteError, count } = await supabaseAdmin
            .from('articles')
            .delete()
            .eq('source', 'AMI');

        if (deleteError) {
            return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            deletedArticles: amiArticles?.length || 0,
            deletedImages: imagesToDelete.length
        });

    } catch (err) {
        console.error('[Cleanup] Server error:', err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
