"use client";
import { useState } from "react";
import { createPriceAlarm } from "@/app/actions/alarm";
import { useRouter } from "next/navigation";

export default function PriceAlarmButton({ productId, currentPrice }: { productId: string, currentPrice: number }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [targetPrice, setTargetPrice] = useState<string>(String(Math.floor(currentPrice * 0.9)));
    const router = useRouter();

    async function handleSetAlarm() {
        const parsedPrice = parseInt(targetPrice, 10);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            alert("Lütfen geçerli bir fiyat girin.");
            return;
        }

        setIsLoading(true);
        const result = await createPriceAlarm(productId, parsedPrice);
        setIsLoading(false);

        if (result.error) {
            if (result.error.includes("giriş yapmalısınız")) {
                router.push("/login");
            } else {
                alert(result.error);
            }
        } else if (result.success) {
            alert(result.success + ` (Hedef: ${parsedPrice} TL)`);
            setShowModal(false);
        }
    }

    return (
        <>
            <button 
                onClick={() => setShowModal(true)} 
                className="compare-btn"
                style={{padding: '10px 15px', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}
            >
                <i className="fa-regular fa-bell"></i> Fiyat Alarmı Kur
            </button>

            {showModal && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}>
                    <div style={{backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', border: '1px solid #333'}}>
                        <h3 style={{marginBottom: '15px', color: '#fff'}}>Fiyat Alarmı Kur</h3>
                        <p style={{color: '#aaa', marginBottom: '20px', fontSize: '14px'}}>
                            Şu anki fiyat: <strong>{currentPrice.toLocaleString('tr-TR')} TL</strong><br/>
                            Hangi fiyatın altına düştüğünde size haber verelim?
                        </p>
                        <input 
                            type="number" 
                            value={targetPrice} 
                            onChange={(e) => setTargetPrice(e.target.value)}
                            style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#111', color: '#fff', marginBottom: '20px', fontSize: '16px'}}
                        />
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={() => setShowModal(false)} style={{flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer'}}>İptal</button>
                            <button onClick={handleSetAlarm} disabled={isLoading} style={{flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#e50914', color: '#fff', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1}}>
                                {isLoading ? 'Kuruluyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
