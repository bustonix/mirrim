"use client";

import Header from "@/components/Header";
import AdBanner from "@/components/AdBanner";
import NewsCard from "@/components/NewsCard";
import SourceFilter from "@/components/SourceFilter";
import Footer from "@/components/Footer";
import ArticleModal from "@/components/ArticleModal";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatTimeAgo } from "@/lib/utils";
import { Article } from "@/lib/scraper";
import { useTranslation } from "@/lib/i18n/useTranslation";

import { Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const currentLang = searchParams.get("lang") === "ar" ? "ar" : "fr";
  const { t, isRTL } = useTranslation();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // Modal State
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Scroll to top on language change or source change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentLang, selectedSource]);

  useEffect(() => {
    async function getNews() {
      setLoading(true);
      try {
        const res = await fetch(`/api/news?lang=${currentLang}`);
        const data = await res.json();
        if (data.success) {
          setArticles(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setLoading(false);
      }
    }

    // Reset selection when changing language
    setSelectedSource(null);
    getNews();
  }, [currentLang]);

  // Extract unique sources for the filter bar
  const uniqueSources = Array.from(new Set(articles.map(a => a.source)));

  const displayedArticles = selectedSource
    ? articles.filter(a => a.source === selectedSource)
    : articles;

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen bg-muted/30 pb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
      <Header />

      {/* Sticky Filter Bar */}
      <SourceFilter
        sources={uniqueSources}
        selectedSource={selectedSource}
        onSelectSource={setSelectedSource}
      />

      <div className="container mx-auto px-4 space-y-6">

        <AdBanner />

        {/* Dynamic Heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t('topNews')}
          </h2>
          <span className="text-xs text-muted-foreground" suppressHydrationWarning>
            {currentLang === 'ar' ? `آخر تحديث: ${formatTimeAgo(new Date().toISOString(), 'ar')}` : `Mise à jour : ${formatTimeAgo(new Date().toISOString(), 'fr')}`}
          </span>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-center col-span-full py-20 text-muted-foreground animate-pulse">
              {currentLang === 'ar' ? "جار تحميل الأخبار..." : "Chargement des actualités..."}
            </p>
          ) : displayedArticles.length === 0 ? (
            <p className="text-center col-span-full py-20 text-muted-foreground">
              {currentLang === 'ar' ? "لا توجد أخبار" : "Aucun article trouvé pour cette source."}
            </p>
          ) : (
            displayedArticles.flatMap((news, idx) => {
              const card = (
                <NewsCard
                  key={`article-${idx}`}
                  source={news.source}
                  category={news.category || (currentLang === 'ar' ? "أخبار" : "Actualité")}
                  title={news.title}
                  excerpt={news.excerpt || (currentLang === 'ar' ? "اقرأ المزيد..." : "Cliquez pour lire l'article complet...")}
                  timeAgo={formatTimeAgo(news.pubDate, currentLang)}
                  imageUrl={news.imageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60"}
                  onClick={() => handleArticleClick(news)}
                />
              );

              // Insert an Ad every 6 articles (after index 5, 11, 17, ...)
              if ((idx + 1) % 6 === 0 && idx > 0) {
                return [
                  card,
                  <div key={`ad-${idx}`} className="col-span-full">
                    <AdBanner />
                  </div>
                ];
              }
              return [card];
            })
          )}
        </div>

      </div>

      <Footer />

      {/* Article Preview Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
