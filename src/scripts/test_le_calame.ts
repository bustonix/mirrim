
import { extractArticleImage } from '../lib/imageExtractor';

async function testLeCalame() {
    // Example URL from user
    const url = 'http://lecalame.info/?q=node/17766';

    console.log(`Testing Le Calame extraction for: ${url}`);

    try {
        const result = await extractArticleImage(url);
        console.log('--- Result ---');
        console.log('Image URL:', result.imageUrl);
        console.log('Method:', result.method);

        if (result.imageUrl?.includes('/styles/')) {
            console.log('⚠️ WARNING: Got derivative image (style), expected original if available.');
        } else if (result.imageUrl?.includes('/sites/default/files/')) {
            console.log('✅ SUCCESS: Got original image.');
        } else {
            console.log('❌ ERROR: Unexpected image source.');
        }

    } catch (error) {
        console.error('Error running test:', error);
    }
}

testLeCalame();
