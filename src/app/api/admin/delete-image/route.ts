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

        // Get current image URL to delete from storage
        const { data: article, error: fetchError } = await supabaseAdmin
            .from('articles')
            .select('image_url')
            .eq('id', articleId)
            .single();

        if (fetchError) {
            return NextResponse.json(
                { success: false, error: fetchError.message },
                { status: 500 }
            );
        }

        // Delete from storage if it's a Supabase Storage URL
        if (article?.image_url && article.image_url.includes('supabase')) {
            const filename = article.image_url.split('/').pop();
            if (filename) {
                await supabaseAdmin.storage
                    .from('news-images')
                    .remove([filename]);
            }
        }

        // Set image_url to null in database
        const { error: updateError } = await supabaseAdmin
            .from('articles')
            .update({ image_url: null })
            .eq('id', articleId);

        if (updateError) {
            return NextResponse.json(
                { success: false, error: updateError.message },
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
