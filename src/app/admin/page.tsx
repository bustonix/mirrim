"use client";

import { useEffect, useState } from "react";
import { Upload, Image as ImageIcon, ExternalLink, RefreshCw, Search, Trash2, Replace, Lock } from "lucide-react";

interface ArticleRow {
    id: string;
    title: string;
    source: string;
    link: string;
    image_url: string | null;
    created_at: string;
}

const ADMIN_PASSWORD = "mirrim2025"; // Simple password protection

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [authError, setAuthError] = useState(false);

    const [articles, setArticles] = useState<ArticleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'without' | 'with'>('without');

    // Bulk selection state
    const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setAuthError(false);
            sessionStorage.setItem('admin_auth', 'true');
        } else {
            setAuthError(true);
        }
    };

    // Check session on mount
    useEffect(() => {
        if (sessionStorage.getItem('admin_auth') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/articles');
            const data = await res.json();
            if (data.success) {
                setArticles(data.articles);
                setSelectedArticles(new Set()); // Reset selection
            }
        } catch (err) {
            console.error("Failed to fetch articles", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleImageUpload = async (articleId: string, file: File) => {
        setUploading(articleId);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('articleId', articleId);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Image uploadée avec succès!' });
                setArticles(prev => prev.map(a =>
                    a.id === articleId ? { ...a, image_url: data.imageUrl } : a
                ));
            } else {
                setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'upload' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur réseau' });
        } finally {
            setUploading(null);
        }
    };

    const handleDeleteImage = async (articleId: string) => {
        if (!confirm("Supprimer cette image ? L'article reviendra dans la liste 'Sans images'.")) return;

        setDeleting(articleId);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/delete-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Image supprimée!' });
                setArticles(prev => prev.map(a =>
                    a.id === articleId ? { ...a, image_url: null } : a
                ));
            } else {
                setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur réseau' });
        } finally {
            setDeleting(null);
        }
    };

    const handleDeleteArticle = async (articleId: string, title: string) => {
        if (!confirm(`Supprimer définitivement cet article ?\n\n"${title.substring(0, 50)}..."\n\nCette action est irréversible.`)) return;

        setDeleting(articleId);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/delete-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Article supprimé!' });
                setArticles(prev => prev.filter(a => a.id !== articleId));
                setSelectedArticles(prev => {
                    const next = new Set(prev);
                    next.delete(articleId);
                    return next;
                });
            } else {
                setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur réseau' });
        } finally {
            setDeleting(null);
        }
    };

    // Filter by search query
    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const articlesWithoutImages = filteredArticles.filter(a => !a.image_url || a.image_url.includes('unsplash.com'));
    const articlesWithImages = filteredArticles.filter(a => a.image_url && !a.image_url.includes('unsplash.com'));

    const displayedArticles = activeTab === 'without' ? articlesWithoutImages : articlesWithImages;

    // Bulk actions
    const toggleSelectAll = () => {
        if (selectedArticles.size === displayedArticles.length) {
            setSelectedArticles(new Set());
        } else {
            setSelectedArticles(new Set(displayedArticles.map(a => a.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedArticles);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedArticles(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedArticles.size === 0) return;
        if (!confirm(`Supprimer définitivement ces ${selectedArticles.size} articles ?`)) return;

        setBulkDeleting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleIds: Array.from(selectedArticles) })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: `${selectedArticles.size} articles supprimés avec succès!` });
                setArticles(prev => prev.filter(a => !selectedArticles.has(a.id)));
                setSelectedArticles(new Set());
            } else {
                setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression groupée' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur réseau' });
        } finally {
            setBulkDeleting(false);
        }
    };

    // Login form if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                <Lock className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold">Admin Panel</h1>
                            <p className="text-muted-foreground mt-1">Entrez le mot de passe pour continuer</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Mot de passe"
                                className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {authError && (
                                <p className="text-red-500 text-sm">Mot de passe incorrect</p>
                            )}
                            <button
                                type="submit"
                                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Connexion
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">🛠️ Admin Panel</h1>
                        <p className="text-muted-foreground">Gérer les images des articles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedArticles.size > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                {bulkDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Supprimer ({selectedArticles.size})
                            </button>
                        )}
                        <button
                            onClick={fetchArticles}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher par titre ou source..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground">Total Articles</p>
                        <p className="text-2xl font-bold">{articles.length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground">Avec Images</p>
                        <p className="text-2xl font-bold text-green-400">{articlesWithImages.length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-muted-foreground">Sans Images</p>
                        <p className="text-2xl font-bold text-yellow-400">{articlesWithoutImages.length}</p>
                    </div>
                </div>

                {/* Tabs & Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setActiveTab('without'); setSelectedArticles(new Set()); }}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'without' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
                        >
                            Sans Images ({articlesWithoutImages.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('with'); setSelectedArticles(new Set()); }}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'with' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
                        >
                            Avec Images ({articlesWithImages.length})
                        </button>
                    </div>

                    {displayedArticles.length > 0 && (
                        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={selectedArticles.size === displayedArticles.length && displayedArticles.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer select-none">
                                Tout sélectionner
                            </label>
                        </div>
                    )}
                </div>

                {/* Articles List */}
                <div className="mb-8">
                    {loading ? (
                        <p className="text-muted-foreground animate-pulse">Chargement...</p>
                    ) : displayedArticles.length === 0 ? (
                        <p className="text-muted-foreground">
                            {searchQuery ? "Aucun résultat pour cette recherche." : (activeTab === 'without' ? "Tous les articles ont des images! 🎉" : "Aucun article avec image.")}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {displayedArticles.map(article => (
                                <div key={article.id} className={`bg-card border ${selectedArticles.has(article.id) ? 'border-primary ring-1 ring-primary' : 'border-border'} rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all`}>

                                    {/* Selection Checkbox */}
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedArticles.has(article.id)}
                                            onChange={() => toggleSelect(article.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        />
                                    </div>

                                    {/* Thumbnail for articles with images */}
                                    {activeTab === 'with' && article.image_url && (
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-accent font-semibold mb-1">{article.source}</p>
                                        <h3 className="font-medium line-clamp-2" title={article.title}>{article.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <a
                                            href={article.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                            title="Voir l'article source"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>

                                        {/* Upload / Replace Button */}
                                        <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                                            {uploading === article.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : activeTab === 'with' ? (
                                                <Replace className="w-4 h-4" />
                                            ) : (
                                                <Upload className="w-4 h-4" />
                                            )}
                                            <span className="hidden sm:inline">{activeTab === 'with' ? 'Remplacer' : 'Upload'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(article.id, file);
                                                }}
                                                disabled={uploading === article.id}
                                            />
                                        </label>

                                        {/* Delete Image Button (only for articles with images) */}
                                        {activeTab === 'with' && (
                                            <button
                                                onClick={() => handleDeleteImage(article.id)}
                                                disabled={deleting === article.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-lg hover:bg-orange-500/30 transition-colors"
                                                title="Supprimer l'image"
                                            >
                                                {deleting === article.id ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">Image</span>
                                            </button>
                                        )}

                                        {/* Delete Article Button */}
                                        <button
                                            onClick={() => handleDeleteArticle(article.id, article.title)}
                                            disabled={deleting === article.id}
                                            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                                            title="Supprimer l'article"
                                        >
                                            {deleting === article.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
