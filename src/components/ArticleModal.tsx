"use client";
import { X, ExternalLink } from "lucide-react";
import { Article } from "@/lib/scraper";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ArticleModalProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
    const { t, isRTL } = useTranslation();

    if (!isOpen || !article) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 ${isRTL ? 'text-right' : 'text-left'}`}>

                {/* Sticky Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-card/95 backdrop-blur border-b border-border">
                    <div className="flex items-center gap-2">
                        {/* Source Badge */}
                        <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                            {article.source}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors text-foreground" aria-label={t('close')}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-6">
                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 leading-tight text-foreground text-balanced">
                        {article.title}
                    </h2>

                    {/* Metadata */}
                    <div className="flex items-center text-xs text-muted-foreground mb-6">
                        <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{article.category || t('news')}</span>
                    </div>

                    {/* Hero Image */}
                    {article.imageUrl && (
                        <div className="w-full aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Excerpt / Body */}
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                        <p className="text-lg leading-relaxed">{article.excerpt}</p>

                        {/* Teaser for full content */}
                        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50 text-sm">
                            <p className="opacity-80">
                                {t('previewNote')}
                            </p>
                        </div>
                    </div>

                    {/* Sticky Bottom Action */}
                    <div className="mt-8 flex justify-center sticky bottom-4 z-10">
                        <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-xl hover:bg-primary/90 transition-transform active:scale-95 border border-primary-foreground/10"
                        >
                            {t('readOn')} {article.source} <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

