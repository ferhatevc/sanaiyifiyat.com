"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FavoriteButton({ productId, isFavorited }: { productId: string, isFavorited: boolean }) {
    const [favorited, setFavorited] = useState(isFavorited);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function toggleFavorite() {
        setLoading(true);
        try {
            const res = await fetch("/api/favorite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId })
            });
            const data = await res.json();
            
            if (res.status === 401) {
                router.push("/login");
                return;
            }

            if (data.action === "added") {
                setFavorited(true);
            } else {
                setFavorited(false);
            }
        } catch (error) {
            console.error("Favori hatası:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button onClick={toggleFavorite} disabled={loading}
            style={{
                padding: '10px 15px', 
                border: favorited ? '2px solid #e50914' : '1px solid #ddd', 
                backgroundColor: favorited ? 'rgba(229, 9, 20, 0.1)' : '#fff', 
                borderRadius: '8px', 
                cursor: loading ? 'wait' : 'pointer', 
                color: favorited ? '#e50914' : '#333',
                transition: 'all 0.3s ease',
                fontWeight: favorited ? 'bold' : 'normal'
            }}>
            <i className={favorited ? "fa-solid fa-heart" : "fa-regular fa-heart"} 
               style={{color: favorited ? '#e50914' : '#333'}}></i>
            {' '}{favorited ? 'Favorilerde' : 'Favoriye Al'}
        </button>
    );
}
