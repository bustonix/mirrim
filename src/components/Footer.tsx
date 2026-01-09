"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card py-6 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-muted-foreground">
                    © {currentYear} <span className="font-semibold text-foreground">MIRRIM</span> - Miroir de l'actualité en Mauritanie
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {t('designedBy')} <a href="https://g4dtech.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">G4DTech</a>
                </p>
            </div>
        </footer>
    );
}

