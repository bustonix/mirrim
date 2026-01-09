"use client";

import { Share2, Clock } from "lucide-react";
import { getSourceMeta } from "@/lib/sources";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface NewsCardProps {
    source: string;
    title: string;
    excerpt: string;
    timeAgo: string;
    imageUrl: string;
    category?: string;
    onClick?: () => void;
}

export default function NewsCard({ source, title, excerpt, timeAgo, imageUrl, category, onClick }: NewsCardProps) {
    const { t, isRTL } = useTranslation();
    const sourceMeta = getSourceMeta(source);

    return (
        <article
            className={`group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
            onClick={onClick}
        >

            {/* Image Container */}
            <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {category && (
                    <span className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} px-2 py-1 text-[10px] font-bold text-white bg-primary/80 backdrop-blur-sm rounded-md uppercase tracking-wider`}>
                        {category}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4">
                {/* Source Header */}
                <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <img
                        src={sourceMeta.logoUrl}
                        alt={source}
                        className="w-5 h-5 rounded-full object-cover bg-accent/20"
                        onError={(e) => {
                            // Fallback to letter if logo not found
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <div className="w-5 h-5 rounded-full bg-accent/20 hidden items-center justify-center text-[10px] font-bold text-accent">
                        {source[0]}
                    </div>
                    <span className="text-xs font-semibold text-accent">{source}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mx-1" />
                        {timeAgo}
                    </div>
                </div>

                <h3 className="text-lg font-bold leading-tight text-foreground mb-2 group-hover:text-accent transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {excerpt}
                </p>

                {/* Footer Actions */}
                <div className={`mt-auto flex items-center justify-between pt-4 border-t border-border/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button className="text-xs font-medium text-foreground hover:text-accent transition-colors flex items-center">
                        {t('readArticle')}
                    </button>

                    <button className="p-2 hover:bg-background rounded-full text-muted-foreground hover:text-foreground transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}

