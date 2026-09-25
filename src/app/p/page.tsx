"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlockRenderer, { Block } from "@/components/builder/BlockRenderer";

export default function DynamicPageViewer() {
  const [data, setData] = useState<{ title: string; content: string } | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // URL'den slug'ı çıkarıyoruz (Örn: /p/benim-projem -> benim-projem)
    const pathParts = window.location.pathname.split("/");
    const slug = pathParts[pathParts.length - 1];

    if (!slug || slug === "p") {
      setError("Sayfa linki geçersiz.");
      setIsLoading(false);
      return;
    }

    fetch(`/api/pages?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        if (res.error || !res.data) {
          setError("Sayfa bulunamadı.");
        } else {
          setData(res.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Sunucu hatası.");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Sayfa yükleniyor...</div>;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-slate-800 dark:text-slate-200">
        <h1 className="text-4xl font-black mb-4 text-pink-500">404</h1>
        <p className="mb-6">{error || "Sayfa bulunamadı."}</p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 transition">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  const renderContent = () => {
    if (!data.content) return null;
    try {
      const blocks = JSON.parse(data.content);
      if (Array.isArray(blocks)) {
        return <BlockRenderer blocks={blocks} />;
      }
    } catch (e) {
      // JSON parse hatası alıyorsa eski sistem (düz metin) demektir.
    }
    // Geriye dönük uyumluluk: Eğer düz metinse tek bir text bloğu gibi çiz.
    return <BlockRenderer blocks={[{ id: "legacy", type: "text", data: { text: data.content } }]} />;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-pink-500 transition mb-10">
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </Link>
        <h1 className="text-4xl md:text-5xl font-black mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500">
          {data.title}
        </h1>
        {renderContent()}
      </div>
    </main>
  );
}
