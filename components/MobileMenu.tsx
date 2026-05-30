"use client";
import { useState, useEffect } from "react";

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    // Menü açıkken scroll'u engelle
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            {/* Hamburger Butonu */}
            <button onClick={() => setIsOpen(!isOpen)} className="mobile-menu-btn"
                style={{
                    display: 'none', background: 'none', border: 'none', color: '#fff',
                    fontSize: '24px', cursor: 'pointer', padding: '8px', zIndex: 1001
                }}>
                <i className={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999,
                        backdropFilter: 'blur(4px)'
                    }} />
            )}

            {/* Slide-in Menü */}
            <nav className="mobile-nav" style={{
                position: 'fixed', top: 0, right: isOpen ? '0' : '-300px',
                width: '280px', height: '100vh', backgroundColor: '#121212',
                zIndex: 1000, transition: 'right 0.3s ease',
                padding: '80px 20px 20px', display: 'flex', flexDirection: 'column', gap: '5px',
                borderLeft: '1px solid #333', overflowY: 'auto'
            }}>
                <a href="/" onClick={() => setIsOpen(false)}
                    style={{padding: '14px 16px', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <i className="fa-solid fa-house" style={{width: '20px'}}></i> Ana Sayfa
                </a>
                <a href="/search" onClick={() => setIsOpen(false)}
                    style={{padding: '14px 16px', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <i className="fa-solid fa-magnifying-glass" style={{width: '20px'}}></i> Ürün Ara
                </a>
                <a href="/liste" onClick={() => setIsOpen(false)}
                    style={{padding: '14px 16px', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, rgba(229,9,20,0.2), rgba(255,107,53,0.2))', border: '1px solid rgba(229,9,20,0.3)'}}>
                    <i className="fa-solid fa-cart-shopping" style={{width: '20px', color: '#e50914'}}></i> 🆕 Alışveriş Listesi
                </a>

                <div style={{borderTop: '1px solid #333', margin: '10px 0'}}></div>
                <p style={{color: '#666', fontSize: '12px', padding: '0 16px', margin: '5px 0'}}>KATEGORİLER</p>

                <a href="/category/cep-telefonu" onClick={() => setIsOpen(false)}
                    style={{padding: '12px 16px', color: '#ccc', textDecoration: 'none', borderRadius: '8px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <i className="fa-solid fa-mobile-screen" style={{width: '20px', color: '#e50914'}}></i> Cep Telefonu
                </a>
                <a href="/category/bilgisayar" onClick={() => setIsOpen(false)}
                    style={{padding: '12px 16px', color: '#ccc', textDecoration: 'none', borderRadius: '8px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <i className="fa-solid fa-laptop" style={{width: '20px', color: '#e50914'}}></i> Bilgisayar
                </a>
                <a href="/category/ev-aletleri" onClick={() => setIsOpen(false)}
                    style={{padding: '12px 16px', color: '#ccc', textDecoration: 'none', borderRadius: '8px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <i className="fa-solid fa-blender" style={{width: '20px', color: '#e50914'}}></i> Ev Aletleri
                </a>
                <a href="/category/giyim" onClick={() => setIsOpen(false)}
                    style={{padding: '12px 16px', color: '#ccc', textDecoration: 'none', borderRadius: '8px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <i className="fa-solid fa-shirt" style={{width: '20px', color: '#e50914'}}></i> Giyim
                </a>

                <div style={{borderTop: '1px solid #333', margin: '10px 0'}}></div>

                <a href="/login" onClick={() => setIsOpen(false)}
                    style={{padding: '14px 16px', color: '#e50914', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <i className="fa-solid fa-right-to-bracket" style={{width: '20px'}}></i> Giriş Yap / Üye Ol
                </a>
            </nav>
        </>
    );
}
