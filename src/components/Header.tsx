"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Moon, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") === "ar" ? "ar" : "fr";

    const setLang = (newLang: "fr" | "ar") => {
        router.push(`/?lang=${newLang}`);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left: Menu & Search */}
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-muted rounded-full transition-colors text-foreground">
                        <Menu className="w-6 h-6" />
                    </button>
                    {/* Placeholder for future search */}
                </div>

                {/* Center: Logo */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <h1 className="text-2xl font-bold tracking-tighter text-primary dark:text-white">
                        MIR<span className="text-accent">RIM</span>
                    </h1>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        Miroir de l'actualité
                    </span>
                </div>

                {/* Right: Language Toggle */}
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center bg-muted rounded-full p-1 h-8 border border-border">
                        <button
                            onClick={() => setLang("fr")}
                            className={cn(
                                "px-3 text-xs font-medium rounded-full h-full transition-all duration-300",
                                lang === "fr"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            FR
                        </button>
                        <button
                            onClick={() => setLang("ar")}
                            className={cn(
                                "px-3 text-xs font-medium rounded-full h-full transition-all duration-300",
                                lang === "ar"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            AR
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
