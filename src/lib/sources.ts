// Source metadata for frontend components
// This should be kept in sync with SOURCES in scraper.ts

export interface SourceMeta {
    name: string;
    displayNameAr: string;
    logoUrl: string;
    language: 'fr' | 'ar';
}

export const SOURCE_META: Record<string, SourceMeta> = {
    'Cridem': {
        name: 'Cridem',
        displayNameAr: 'كريدم',
        logoUrl: '/logos/cridem.png',
        language: 'fr'
    },
    'Essahraa': {
        name: 'Essahraa',
        displayNameAr: 'الصحراء',
        logoUrl: '/logos/essahraa.png',
        language: 'fr'
    },
    'الصحراء': {
        name: 'الصحراء',
        displayNameAr: 'الصحراء',
        logoUrl: '/logos/essahraa.png',
        language: 'ar'
    },
    'Le Calame': {
        name: 'Le Calame',
        displayNameAr: 'القلم',
        logoUrl: '/logos/lecalame.png',
        language: 'fr'
    },
    'Kassataya': {
        name: 'Kassataya',
        displayNameAr: 'كاساتايا',
        logoUrl: '/logos/kassataya.png',
        language: 'fr'
    },
    'Sahara Medias': {
        name: 'Sahara Medias',
        displayNameAr: 'صحراء ميدياس',
        logoUrl: '/logos/saharamedias.png',
        language: 'fr'
    },
    'الأخبار': {
        name: 'الأخبار',
        displayNameAr: 'الأخبار',
        logoUrl: '/logos/alakhbar.png',
        language: 'ar'
    },
    'صحراء ميدياس': {
        name: 'صحراء ميدياس',
        displayNameAr: 'صحراء ميدياس',
        logoUrl: '/logos/saharamedias.png',
        language: 'ar'
    },
    'AMI': {
        name: 'AMI',
        displayNameAr: 'الوكالة',
        logoUrl: '/logos/ami.png',
        language: 'fr' // AMI has both, but logo is the same
    }
};

export function getSourceMeta(sourceName: string): SourceMeta {
    return SOURCE_META[sourceName] || {
        name: sourceName,
        displayNameAr: sourceName,
        logoUrl: '/logos/default.png',
        language: 'fr'
    };
}
