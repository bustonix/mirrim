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

        const BATCH_SIZE = 50;
        let deletedCount = 0;

        // Process in batches to avoid timeouts and query limits
        for (let i = 0; i < articleIds.length; i += BATCH_SIZE) {
            const batchIds = articleIds.slice(i, i + BATCH_SIZE);

            // 1. Get image URLs for this batch
            const { data: articles, error: fetchError } = await supabaseAdmin
                .from('articles')
                .select('image_url')
                .in('id', batchIds);

            if (fetchError) {
                console.error(`Error fetching batch ${i}:`, fetchError);
                continue; // Try next batch? or abort? Continuing is safer for partial progress
            }

            // 2. Delete images from storage (if any)
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
                .in('id', batchIds);

            if (deleteError) {
                console.error(`Error deleting batch ${i}:`, deleteError);
                // Return error immediately if a delete fails, to notify user
                return NextResponse.json(
                    { success: false, error: `Failed at index ${i}: ${deleteError.message}` },
                    { status: 500 }
                );
            }

            deletedCount += batchIds.length;
        }

        return NextResponse.json({ success: true, count: deletedCount });
    } catch (err) {
        console.error('Bulk delete error:', err);
        return NextResponse.json(
            { success: false, error: 'Server error: ' + (err as Error).message },
            { status: 500 }
        );
    }
}
