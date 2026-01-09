"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SourceFilterProps {
    sources: string[];
    selectedSource: string | null;
    onSelectSource: (source: string | null) => void;
}

export default function SourceFilter({ sources, selectedSource, onSelectSource }: SourceFilterProps) {
    const { t } = useTranslation();

    return (
        <div className="sticky top-[60px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border py-2 mb-4">
            <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 min-w-max">
                    <button
                        onClick={() => onSelectSource(null)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                            selectedSource === null
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card hover:bg-muted text-card-foreground border-border"
                        )}
                    >
                        {t('allSources')}
                    </button>

                    {sources.map((source) => (
                        <button
                            key={source}
                            onClick={() => onSelectSource(source)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                selectedSource === source
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card hover:bg-muted text-card-foreground border-border"
                            )}
                        >
                            {source}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
