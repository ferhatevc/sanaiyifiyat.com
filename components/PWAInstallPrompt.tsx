"use client";
import { useState, useEffect } from "react";

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Service Worker kaydı
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((reg) => {
                console.log('✅ SW kaydedildi');
            }).catch((err) => {
                console.log('❌ SW hatası:', err);
            });
        }

        // Zaten yüklenmiş ise (standalone modda) gösterme
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
            || (window.navigator as any).standalone === true;
        if (isStandalone) return;

        // Daha önce kapatıldı mı?
        const dismissed = localStorage.getItem('pwa-dismissed');
        if (dismissed) return;

        // iOS cihaz kontrolü
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Mobil cihaz kontrolü
        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

        // Android: Native install prompt'u yakala
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setTimeout(() => setShowPrompt(true), 2000);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // iOS veya Android'de beforeinstallprompt gelmediyse: 3 saniye sonra göster
        if (isMobile) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('beforeinstallprompt', handler);
            };
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    async function handleInstall() {
        if (deferredPrompt) {
            // Android: Native prompt göster
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('✅ Uygulama yüklendi!');
            }
            setDeferredPrompt(null);
            setShowPrompt(false);
        } else if (isIOS) {
            // iOS: Rehber göster
            setShowIOSGuide(true);
        } else {
            // Diğer: Rehber göster
            setShowIOSGuide(true);
        }
    }

    function handleDismiss() {
        setShowPrompt(false);
        setShowIOSGuide(false);
        localStorage.setItem('pwa-dismissed', 'true');
    }

    if (!isMounted || !showPrompt) return null;

    return (
        <>
            {/* Ana Install Banner */}
            {!showIOSGuide && (
                <div style={{
                    position: 'fixed', bottom: '20px', left: '12px', right: '12px',
                    maxWidth: '420px', margin: '0 auto', zIndex: 9999,
                    background: 'linear-gradient(135deg, #1a1a1a, #121212)',
                    borderRadius: '16px', padding: '20px',
                    border: '1px solid #333',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    animation: 'pwaSU 0.4s ease'
                }}>
                    <button onClick={handleDismiss} style={{
                        position: 'absolute', top: '10px', right: '12px',
                        background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px'
                    }}>✕</button>

                    <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px'}}>
                        <img src="/icon-192x192.png" alt="SanaİyiFiyat" style={{width: '48px', height: '48px', borderRadius: '12px'}} />
                        <div>
                            <h3 style={{margin: 0, fontSize: '16px', color: '#fff'}}>📱 Uygulamayı Yükle</h3>
                            <p style={{margin: 0, fontSize: '12px', color: '#888'}}>Daha hızlı, daha kolay, bildirimlerle!</p>
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '6px', fontSize: '11px', color: '#aaa', marginBottom: '15px', flexWrap: 'wrap'}}>
                        <span style={{padding: '4px 8px', backgroundColor: '#222', borderRadius: '6px'}}>⚡ Süper hızlı</span>
                        <span style={{padding: '4px 8px', backgroundColor: '#222', borderRadius: '6px'}}>🔔 Fiyat bildirimleri</span>
                        <span style={{padding: '4px 8px', backgroundColor: '#222', borderRadius: '6px'}}>📴 Offline çalışır</span>
                    </div>

                    <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={handleInstall} style={{
                            flex: 1, padding: '14px', borderRadius: '10px',
                            border: 'none', backgroundColor: '#e50914', color: '#fff',
                            fontSize: '15px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            <i className="fa-solid fa-download"></i> Yükle (Ücretsiz)
                        </button>
                        <button onClick={handleDismiss} style={{
                            padding: '14px 16px', borderRadius: '10px',
                            border: '1px solid #444', backgroundColor: 'transparent', color: '#888',
                            fontSize: '13px', cursor: 'pointer'
                        }}>
                            Sonra
                        </button>
                    </div>

                    <style>{`@keyframes pwaSU { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
                </div>
            )}

            {/* iOS / Genel Yükleme Rehberi */}
            {showIOSGuide && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }} onClick={handleDismiss}>
                    <div style={{
                        maxWidth: '360px', width: '100%', backgroundColor: '#1a1a1a', borderRadius: '20px',
                        padding: '30px', textAlign: 'center'
                    }} onClick={(e) => e.stopPropagation()}>
                        <img src="/icon-192x192.png" alt="" style={{width: '64px', borderRadius: '16px', marginBottom: '15px'}} />
                        <h3 style={{color: '#fff', marginBottom: '20px', fontSize: '18px'}}>
                            {isIOS ? 'iPhone\'a Nasıl Yüklenir?' : 'Uygulamayı Nasıl Yüklersin?'}
                        </h3>
                        
                        {isIOS ? (
                            <div style={{textAlign: 'left', color: '#ccc', fontSize: '15px', lineHeight: '2.2'}}>
                                <p style={{margin: '0 0 5px'}}><span style={{fontSize: '20px'}}>1️⃣</span> Alt kısımda <span style={{backgroundColor: '#333', padding: '2px 8px', borderRadius: '4px'}}><i className="fa-solid fa-arrow-up-from-bracket" style={{color: '#007AFF'}}></i></span> <strong>Paylaş</strong> butonuna bas</p>
                                <p style={{margin: '0 0 5px'}}><span style={{fontSize: '20px'}}>2️⃣</span> Aşağı kaydır → <strong>"Ana Ekrana Ekle"</strong> seç</p>
                                <p style={{margin: '0'}}><span style={{fontSize: '20px'}}>3️⃣</span> Sağ üstte <strong>"Ekle"</strong> butonuna bas ✅</p>
                            </div>
                        ) : (
                            <div style={{textAlign: 'left', color: '#ccc', fontSize: '15px', lineHeight: '2.2'}}>
                                <p style={{margin: '0 0 5px'}}><span style={{fontSize: '20px'}}>1️⃣</span> Tarayıcıda <strong>⋮</strong> menüsüne tıkla</p>
                                <p style={{margin: '0 0 5px'}}><span style={{fontSize: '20px'}}>2️⃣</span> <strong>"Ana ekrana ekle"</strong> veya <strong>"Uygulamayı yükle"</strong> seç</p>
                                <p style={{margin: '0'}}><span style={{fontSize: '20px'}}>3️⃣</span> <strong>"Yükle"</strong> butonuna bas ✅</p>
                            </div>
                        )}

                        <button onClick={handleDismiss} style={{
                            marginTop: '25px', padding: '14px 40px', borderRadius: '10px',
                            border: 'none', backgroundColor: '#e50914', color: '#fff',
                            fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%'
                        }}>Anladım 👍</button>
                    </div>
                </div>
            )}
        </>
    );
}
