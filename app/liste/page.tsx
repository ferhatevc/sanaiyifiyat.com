"use client";

import { useState } from "react";
import Link from "next/link";

interface ShoppingResult {
  query: string;
  found: boolean;
  product?: {
    id: string;
    title: string;
    image: string;
    brand: string;
    category: string;
  };
  bestOffer?: {
    vendor: string;
    price: number;
    priceText: string;
    url: string;
  };
  totalOffers?: number;
  maxPrice?: number;
  savings?: number;
  savingsText?: string;
  alternatives?: {
    vendor: string;
    price: number;
    priceText: string;
    url: string;
  }[];
}

interface Summary {
  totalItems: number;
  foundItems: number;
  notFoundItems: number;
  totalCheapest: number;
  totalCheapestText: string;
  totalExpensive: number;
  totalExpensiveText: string;
  totalSavings: number;
  totalSavingsText: string;
}

export default function ShoppingListPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ShoppingResult[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResults([]);
    setSummary(null);

    const items = input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    try {
      const res = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      setResults(data.results || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Hata:", err);
    } finally {
      setLoading(false);
    }
  };

  const exampleList = `iPhone 15
Airfryer
Nike Ayakkabı
Bluetooth Kulaklık
Robot Süpürge`;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#666", fontSize: "14px" }}>← Ana Sayfa</span>
        </Link>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "800",
            marginTop: "10px",
            background: "linear-gradient(135deg, #e50914, #ff6b35)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🛒 Akıllı Alışveriş Listesi
        </h1>
        <p style={{ color: "#888", fontSize: "16px", marginTop: "8px" }}>
          Almak istediğin ürünleri yaz, biz her birinin{" "}
          <strong style={{ color: "#e50914" }}>en ucuz fiyatını</strong> bulalım!
        </p>
      </div>

      {/* Input Area */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          marginBottom: "30px",
          border: "1px solid #eee",
        }}
      >
        <label
          style={{
            display: "block",
            fontWeight: "700",
            fontSize: "16px",
            marginBottom: "12px",
            color: "#333",
          }}
        >
          📝 Alışveriş Listeni Yaz
          <span style={{ color: "#999", fontWeight: "400", fontSize: "13px", marginLeft: "8px" }}>
            (Her satıra bir ürün)
          </span>
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Örnek:\niPhone 15\nAirfryer\nNike Ayakkabı\nBluetooth Kulaklık`}
          rows={6}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            border: "2px solid #e0e0e0",
            fontSize: "16px",
            lineHeight: "1.8",
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none",
            transition: "border-color 0.3s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#e50914")}
          onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
        />

        <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
          <button
            onClick={handleSearch}
            disabled={loading || !input.trim()}
            style={{
              background: loading
                ? "#ccc"
                : "linear-gradient(135deg, #e50914, #ff4444)",
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 15px rgba(229,9,20,0.3)",
            }}
          >
            {loading ? (
              <>⏳ Fiyatlar aranıyor...</>
            ) : (
              <>🔍 En Ucuz Fiyatları Bul</>
            )}
          </button>

          <button
            onClick={() => setInput(exampleList)}
            style={{
              background: "#f5f5f5",
              color: "#666",
              border: "1px solid #ddd",
              padding: "14px 24px",
              borderRadius: "12px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            📋 Örnek Liste Yükle
          </button>
        </div>
      </div>

      {/* Summary Card */}
      {summary && (
        <div
          style={{
            background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)",
            borderRadius: "16px",
            padding: "30px",
            marginBottom: "30px",
            color: "#fff",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", margin: "0 0 20px 0" }}>
            📊 Alışveriş Listesi Özeti
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#aaa", marginBottom: "4px" }}>Bulunan Ürün</div>
              <div style={{ fontSize: "28px", fontWeight: "800" }}>
                {summary.foundItems}/{summary.totalItems}
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#aaa", marginBottom: "4px" }}>En Ucuz Toplam</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#4ade80" }}>
                {summary.totalCheapestText}
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: "#aaa", marginBottom: "4px" }}>En Pahalı Toplam</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#f87171", textDecoration: "line-through" }}>
                {summary.totalExpensiveText}
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(34,197,94,0.2)", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid rgba(34,197,94,0.3)" }}>
              <div style={{ fontSize: "14px", color: "#4ade80", marginBottom: "4px" }}>💰 Toplam Tasarruf</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#4ade80" }}>
                {summary.totalSavingsText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {results.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: item.found ? "1px solid #eee" : "1px solid #fee2e2",
                transition: "transform 0.2s",
              }}
            >
              {item.found && item.product && item.bestOffer ? (
                <div>
                  {/* Product Row */}
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    {/* Image */}
                    <div style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: "#f5f5f5",
                    }}>
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/80x80/f5f5f5/999?text=📦";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>
                        Aradığın: <strong style={{ color: "#e50914" }}>{item.query}</strong>
                      </div>
                      <Link
                        href={`/product/${item.product.id}`}
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#333",
                          textDecoration: "none",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.product.title}
                      </Link>
                      <div style={{ marginTop: "4px", fontSize: "13px", color: "#888" }}>
                        {item.totalOffers} farklı mağazada bulundu
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "22px", fontWeight: "800", color: "#e50914" }}>
                        {item.bestOffer.priceText}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#fff",
                        backgroundColor: "#e50914",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        display: "inline-block",
                        marginTop: "4px",
                      }}>
                        {item.bestOffer.vendor}
                      </div>
                      {item.savings && item.savings > 0 && (
                        <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600", marginTop: "4px" }}>
                          💰 {item.savingsText} tasarruf
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expand Button */}
                  {item.alternatives && item.alternatives.length > 1 && (
                    <div style={{ marginTop: "12px" }}>
                      <button
                        onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                        style={{
                          background: "none",
                          border: "1px solid #eee",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontSize: "13px",
                          color: "#666",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        {expandedItem === index ? "▲ Diğer mağazaları gizle" : `▼ Diğer ${item.alternatives.length - 1} mağazayı göster`}
                      </button>

                      {expandedItem === index && (
                        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                          {item.alternatives.map((alt, ai) => (
                            <a
                              key={ai}
                              href={alt.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px 14px",
                                backgroundColor: ai === 0 ? "#f0fdf4" : "#f9f9f9",
                                borderRadius: "8px",
                                textDecoration: "none",
                                color: "#333",
                                border: ai === 0 ? "1px solid #bbf7d0" : "1px solid #eee",
                              }}
                            >
                              <span style={{ fontWeight: "500" }}>
                                {ai === 0 && "🏆 "}{alt.vendor}
                              </span>
                              <span style={{ fontWeight: "700", color: ai === 0 ? "#16a34a" : "#333" }}>
                                {alt.priceText}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buy Button */}
                  <a
                    href={item.bestOffer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "14px",
                      padding: "12px",
                      background: "linear-gradient(135deg, #16a34a, #22c55e)",
                      color: "#fff",
                      borderRadius: "10px",
                      textDecoration: "none",
                      fontWeight: "700",
                      fontSize: "14px",
                      boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                    }}
                  >
                    🛒 En Ucuz Fiyatla Satın Al → {item.bestOffer.vendor}
                  </a>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#999" }}>
                  <span style={{ fontSize: "24px" }}>😔</span>
                  <div>
                    <div style={{ fontWeight: "600", color: "#666" }}>
                      &quot;{item.query}&quot; bulunamadı
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      Bu ürün henüz veritabanımızda yok. Yakında eklenecek!
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛍️</div>
          <p style={{ fontSize: "18px", fontWeight: "500", color: "#666" }}>
            Almak istediğin ürünleri yukarıya yaz
          </p>
          <p style={{ fontSize: "14px" }}>
            Her satıra bir ürün yaz, biz en ucuz fiyatları bulalım!
          </p>
        </div>
      )}
    </div>
  );
}
