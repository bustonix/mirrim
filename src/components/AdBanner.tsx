"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

export default function AdBanner() {
    const { t } = useTranslation();

    return (
        <div className="w-full bg-muted/50 py-4 border-b border-border">
            <div className="container mx-auto px-4">
                {/* Ad Placeholder Container */}
                <div className="w-full max-w-[728px] h-[90px] mx-auto bg-muted border border-dashed border-border rounded-lg flex items-center justify-center relative overflow-hidden group hover:border-accent transition-colors">

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">{t('advertising')}</p>
                        <p className="text-sm text-foreground font-medium">{t('adSpaceAvailable')}</p>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
                </div>
            </div>
        </div>
    );
}

