import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { articleId } = await request.json();

        if (!articleId) {
            return NextResponse.json(
                { success: false, error: 'articleId is required' },
                { status: 400 }
            );
        }

        // Get current image URL to delete from storage first
        const { data: article, error: fetchError } = await supabaseAdmin
            .from('articles')
            .select('image_url')
            .eq('id', articleId)
            .single();

        // Delete image from storage if it exists
        if (article?.image_url && article.image_url.includes('supabase')) {
            const filename = article.image_url.split('/').pop();
            if (filename) {
                await supabaseAdmin.storage
                    .from('news-images')
                    .remove([filename]);
            }
        }

        // Delete article from database
        const { error: deleteError } = await supabaseAdmin
            .from('articles')
            .delete()
            .eq('id', articleId);

        if (deleteError) {
            return NextResponse.json(
                { success: false, error: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Server error:', err);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
