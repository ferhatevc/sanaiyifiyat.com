"use client";
import { useState, useEffect } from "react";

interface PricePredictionProps {
    currentPrice: number;
    priceHistory?: { date: string; price: number }[];
}

export default function PricePrediction({ currentPrice, priceHistory }: PricePredictionProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);
    if (!isMounted || currentPrice <= 0) return null;

    // Basit trend analizi (Hareketli Ortalama + Momentum)
    let trend: "down" | "up" | "stable" = "stable";
    let confidence = 50;
    let predictedPrice = currentPrice;
    let recommendation: "buy" | "wait" | "rising" = "buy";

    if (priceHistory && priceHistory.length >= 5) {
        const sorted = [...priceHistory]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const prices = sorted.map(h => h.price);
        const recent = prices.slice(-7); // Son 7 kayıt
        const older = prices.slice(-14, -7); // Bir önceki 7 kayıt

        if (recent.length >= 3 && older.length >= 3) {
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
            const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

            if (changePercent < -2) {
                trend = "down";
                confidence = Math.min(85, 60 + Math.abs(changePercent) * 3);
                predictedPrice = currentPrice * (1 + changePercent / 200);
                recommendation = "wait";
            } else if (changePercent > 2) {
                trend = "up";
                confidence = Math.min(85, 60 + changePercent * 3);
                predictedPrice = currentPrice * (1 + changePercent / 200);
                recommendation = "buy";
            } else {
                trend = "stable";
                confidence = 70;
                predictedPrice = currentPrice;
                recommendation = "buy";
            }
        }
    } else {
        // Yeterli veri yok, genel pazar tahmini
        const month = new Date().getMonth();
        // Kasım (11) = Black Friday, Ocak (0) = Yılbaşı indirimleri
        if (month === 10 || month === 11) {
            trend = "down"; confidence = 65; recommendation = "wait";
            predictedPrice = currentPrice * 0.92;
        } else if (month >= 5 && month <= 8) {
            trend = "stable"; confidence = 55; recommendation = "buy";
            predictedPrice = currentPrice;
        } else {
            trend = "up"; confidence = 50; recommendation = "buy";
            predictedPrice = currentPrice * 1.03;
        }
    }

    const colors = {
        buy: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#22c55e', icon: '✅' },
        wait: { bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308', text: '#eab308', icon: '⏳' },
        rising: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444', icon: '📈' }
    };

    const c = colors[recommendation];

    return (
        <div style={{
            marginTop: '20px', padding: '20px', borderRadius: '12px',
            backgroundColor: c.bg, border: `1px solid ${c.border}`,
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                <span style={{fontSize: '28px'}}>{c.icon}</span>
                <div>
                    <h4 style={{margin: 0, color: c.text, fontSize: '16px'}}>
                        🧠 AI Fiyat Tahmini
                    </h4>
                    <span style={{fontSize: '11px', color: '#888'}}>%{Math.round(confidence)} güvenilirlik</span>
                </div>
            </div>

            <p style={{margin: '0 0 10px', fontSize: '14px', color: '#ddd', lineHeight: '1.6'}}>
                {recommendation === "buy" && (
                    <>Bu ürünün fiyatı şu an <strong style={{color: '#22c55e'}}>stabil veya yükselme eğiliminde</strong>. Almak için uygun bir zaman!</>
                )}
                {recommendation === "wait" && (
                    <>Bu ürünün fiyatı <strong style={{color: '#eab308'}}>düşüş trendinde</strong>. Biraz beklemenizi öneririz — tahmini fiyat: <strong>{Math.round(predictedPrice).toLocaleString('tr-TR')} TL</strong></>
                )}
                {recommendation === "rising" && (
                    <>Bu ürünün fiyatı <strong style={{color: '#ef4444'}}>yükseliyor</strong>. Eğer almayı düşünüyorsanız ertelemeyin!</>
                )}
            </p>

            {/* Güvenilirlik Barı */}
            <div style={{height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden'}}>
                <div style={{
                    width: `${confidence}%`, height: '100%', borderRadius: '2px',
                    backgroundColor: c.border, transition: 'width 1s ease'
                }}></div>
            </div>
        </div>
    );
}
