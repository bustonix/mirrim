import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('id, title, source, link, image_url, created_at')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, articles: data });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
