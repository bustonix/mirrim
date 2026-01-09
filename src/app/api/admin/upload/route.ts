import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const articleId = formData.get('articleId') as string;

        if (!file || !articleId) {
            return NextResponse.json(
                { success: false, error: 'File and articleId are required' },
                { status: 400 }
            );
        }

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${articleId}-${Date.now()}.${ext}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('news-images')
            .upload(filename, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { success: false, error: uploadError.message },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('news-images')
            .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;

        // Update article in database
        const { error: updateError } = await supabaseAdmin
            .from('articles')
            .update({ image_url: publicUrl })
            .eq('id', articleId);

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, imageUrl: publicUrl });
    } catch (err) {
        console.error('Server error:', err);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
