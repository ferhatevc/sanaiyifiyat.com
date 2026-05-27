"use client";
import { useState } from "react";
import { createPriceAlarm } from "@/app/actions/alarm";
import { useRouter } from "next/navigation";

export default function PriceAlarmButton({ productId, currentPrice }: { productId: string, currentPrice: number }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSetAlarm() {
        // Kullanıcıya hedef fiyatı soruyoruz (Basit bir browser prompt ile)
        const userInput = prompt(`Şu anki fiyat: ${currentPrice} TL.\nHangi fiyatın altına düştüğünde haber verelim?`, String(Math.floor(currentPrice * 0.9)));
        
        if (!userInput) return;

        const targetPrice = parseInt(userInput.replace(/\D/g, ''), 10);
        if (isNaN(targetPrice) || targetPrice <= 0) {
            alert("Lütfen geçerli bir fiyat girin.");
            return;
        }

        setIsLoading(true);
        const result = await createPriceAlarm(productId, targetPrice);
        setIsLoading(false);

        if (result.error) {
            alert(result.error);
            if (result.error.includes("giriş yapmalısınız")) {
                router.push("/login");
            }
        } else if (result.success) {
            alert(result.success + ` (Hedef: ${targetPrice} TL)`);
        }
    }

    return (
        <button 
            onClick={handleSetAlarm} 
            disabled={isLoading}
            style={{padding: '10px 15px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '8px', cursor: isLoading ? 'wait' : 'pointer', color: '#333'}}
        >
            <i className="fa-regular fa-bell"></i> {isLoading ? 'Kuruluyor...' : 'Fiyat Alarmı Kur'}
        </button>
    );
}
