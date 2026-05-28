"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompareBar() {
    const [compareIds, setCompareIds] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // LocalStorage'dan karşılaştırma listesini yükle
        const saved = localStorage.getItem("compare_ids");
        if (saved) {
            const ids = JSON.parse(saved);
            setCompareIds(ids);
            setIsVisible(ids.length > 0);
        }

        // Diğer component'lardan gelen event'leri dinle
        function handleCompareUpdate(e: CustomEvent) {
            const { productId, action } = e.detail;
            setCompareIds(prev => {
                let updated: string[];
                if (action === "add" && prev.length < 4) {
                    updated = [...prev, productId];
                } else if (action === "remove") {
                    updated = prev.filter(id => id !== productId);
                } else {
                    return prev;
                }
                localStorage.setItem("compare_ids", JSON.stringify(updated));
                setIsVisible(updated.length > 0);
                return updated;
            });
        }

        window.addEventListener("compare-update", handleCompareUpdate as any);
        return () => window.removeEventListener("compare-update", handleCompareUpdate as any);
    }, []);

    function clearAll() {
        setCompareIds([]);
        localStorage.removeItem("compare_ids");
        setIsVisible(false);
    }

    function goCompare() {
        router.push(`/compare?ids=${compareIds.join(",")}`);
    }

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900,
            background: 'linear-gradient(135deg, #121212, #1a1a1a)',
            borderTop: '2px solid #e50914',
            padding: '12px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.3s ease'
        }}>
            <i className="fa-solid fa-scale-balanced" style={{color: '#e50914', fontSize: '20px'}}></i>
            <span style={{color: '#fff', fontSize: '14px', fontWeight: '500'}}>
                {compareIds.length} ürün seçildi <span style={{color: '#888'}}>(max 4)</span>
            </span>
            <button onClick={goCompare}
                style={{padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#e50914', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'}}>
                Karşılaştır <i className="fa-solid fa-arrow-right" style={{marginLeft: '5px'}}></i>
            </button>
            <button onClick={clearAll}
                style={{padding: '10px 16px', borderRadius: '8px', border: '1px solid #444', backgroundColor: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '13px'}}>
                Temizle
            </button>

            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        </div>
    );
}

// Dışarıdan çağırılacak yardımcı fonksiyon
export function toggleCompare(productId: string) {
    const saved = localStorage.getItem("compare_ids");
    const ids: string[] = saved ? JSON.parse(saved) : [];
    
    const isAlready = ids.includes(productId);
    const action = isAlready ? "remove" : "add";
    
    window.dispatchEvent(new CustomEvent("compare-update", { detail: { productId, action } }));
    return !isAlready; // true = eklendi, false = çıkarıldı
}
