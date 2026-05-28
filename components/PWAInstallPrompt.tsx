"use client";
import { useState, useEffect } from "react";

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);

    useEffect(() => {
        // Service Worker kaydı
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((reg) => {
                console.log('✅ Service Worker kaydedildi:', reg.scope);
            }).catch((err) => {
                console.log('❌ Service Worker hatası:', err);
            });
        }

        // iOS kontrolü
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isInStandalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsIOS(isIOSDevice);

        // Zaten yüklenmiş ise gösterme
        if (isInStandalone) return;

        // Android/Desktop install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Kullanıcı daha önce kapatmadıysa göster
            const dismissed = localStorage.getItem('pwa-dismissed');
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 3000); // 3 saniye sonra göster
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // iOS için: Daha önce kapatmadıysa göster
        if (isIOSDevice && !isInStandalone) {
            const dismissed = localStorage.getItem('pwa-dismissed');
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 5000);
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    async function handleInstall() {
        if (isIOS) {
            setShowIOSGuide(true);
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('✅ Uygulama yüklendi!');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
    }

    function handleDismiss() {
        setShowPrompt(false);
        setShowIOSGuide(false);
        localStorage.setItem('pwa-dismissed', 'true');
    }

    if (!showPrompt) return null;

    return (
        <>
            {/* Ana Install Banner */}
            <div style={{
                position: 'fixed', bottom: '20px', left: '20px', right: '20px',
                maxWidth: '420px', margin: '0 auto', zIndex: 9999,
                background: 'linear-gradient(135deg, #1a1a1a, #121212)',
                borderRadius: '16px', padding: '20px',
                border: '1px solid #333',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                animation: 'slideUp 0.4s ease'
            }}>
                <button onClick={handleDismiss} style={{
                    position: 'absolute', top: '10px', right: '12px',
                    background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px'
                }}>✕</button>

                <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px'}}>
                    <img src="/icon-192x192.png" alt="SanaİyiFiyat" style={{width: '48px', height: '48px', borderRadius: '12px'}} />
                    <div>
                        <h3 style={{margin: 0, fontSize: '16px', color: '#fff'}}>Sana İyi Fiyat</h3>
                        <p style={{margin: 0, fontSize: '12px', color: '#888'}}>Telefonuna yükle, daha hızlı kullan!</p>
                    </div>
                </div>

                <div style={{display: 'flex', gap: '8px', fontSize: '11px', color: '#aaa', marginBottom: '15px', flexWrap: 'wrap'}}>
                    <span style={{padding: '4px 8px', backgroundColor: '#222', borderRadius: '6px'}}>📱 Offline çalışır</span>
                    <span style={{padding: '4px 8px', backgroundColor: '#222', borderRadius: '6px'}}>🔔 Fiyat bildirimleri</span>
                    <span style={{padding: '4px 8px', backgroundColor: '#222', borderRadius: '6px'}}>⚡ Süper hızlı</span>
                </div>

                <button onClick={handleInstall} style={{
                    width: '100%', padding: '14px', borderRadius: '10px',
                    border: 'none', backgroundColor: '#e50914', color: '#fff',
                    fontSize: '15px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                    <i className="fa-solid fa-download"></i> Uygulamayı Yükle (Ücretsiz)
                </button>

                <style>{`@keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
            </div>

            {/* iOS Yükleme Rehberi */}
            {showIOSGuide && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        maxWidth: '360px', backgroundColor: '#1a1a1a', borderRadius: '20px',
                        padding: '30px', textAlign: 'center'
                    }}>
                        <img src="/icon-192x192.png" alt="" style={{width: '64px', borderRadius: '16px', marginBottom: '15px'}} />
                        <h3 style={{color: '#fff', marginBottom: '20px'}}>iPhone'a Nasıl Yüklenir?</h3>
                        
                        <div style={{textAlign: 'left', color: '#ccc', fontSize: '14px', lineHeight: '2'}}>
                            <p><strong>1.</strong> Alt kısımda <i className="fa-solid fa-arrow-up-from-bracket" style={{color: '#007AFF'}}></i> <strong>Paylaş</strong> butonuna bas</p>
                            <p><strong>2.</strong> Aşağı kaydır → <strong>"Ana Ekrana Ekle"</strong> seç</p>
                            <p><strong>3.</strong> Sağ üstte <strong>"Ekle"</strong> butonuna bas</p>
                        </div>

                        <button onClick={handleDismiss} style={{
                            marginTop: '20px', padding: '12px 30px', borderRadius: '10px',
                            border: 'none', backgroundColor: '#e50914', color: '#fff',
                            fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
                        }}>Anladım</button>
                    </div>
                </div>
            )}
        </>
    );
}
