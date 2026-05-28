"use client";
import { useState, useEffect } from "react";

export default function PWAInstallPrompt() {
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        // Standalone modda ise (zaten yüklü) gösterme
        try {
            const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
            if (standalone) return;
        } catch(e) {}

        // Daha önce kapatıldıysa gösterme
        try {
            if (localStorage.getItem('pwa-no')) return;
        } catch(e) {}

        // iOS kontrolü
        const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        setIsIOS(ios);

        // 3 saniye sonra göster
        const t = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(t);
    }, []);

    function install() {
        const p = (window as any).__pwaPrompt;
        if (p) {
            p.prompt();
            p.userChoice.then(() => setShow(false));
        } else {
            setShowGuide(true);
        }
    }

    function close() {
        setShow(false);
        setShowGuide(false);
        try { localStorage.setItem('pwa-no', '1'); } catch(e) {}
    }

    if (!show) return null;

    if (showGuide) {
        return (
            <div onClick={close} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.85)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
                <div onClick={e=>e.stopPropagation()} style={{maxWidth:360,width:'100%',background:'#1a1a1a',borderRadius:20,padding:30,textAlign:'center'}}>
                    <img src="/icon-192x192.png" alt="" style={{width:64,borderRadius:16,marginBottom:15}} />
                    <h3 style={{color:'#fff',marginBottom:20,fontSize:18}}>
                        {isIOS ? "iPhone'a Nasıl Yüklenir?" : "Uygulamayı Nasıl Yüklersin?"}
                    </h3>
                    <div style={{textAlign:'left',color:'#ccc',fontSize:15,lineHeight:'2.2'}}>
                        {isIOS ? (<>
                            <p style={{margin:'0 0 5px'}}>1️⃣ Alt kısımda <strong style={{color:'#007AFF'}}>↑ Paylaş</strong> butonuna bas</p>
                            <p style={{margin:'0 0 5px'}}>2️⃣ Aşağı kaydır → <strong>Ana Ekrana Ekle</strong></p>
                            <p style={{margin:0}}>3️⃣ Sağ üstte <strong>Ekle</strong> butonuna bas ✅</p>
                        </>) : (<>
                            <p style={{margin:'0 0 5px'}}>1️⃣ Tarayıcıda <strong>⋮</strong> menüsüne tıkla</p>
                            <p style={{margin:'0 0 5px'}}>2️⃣ <strong>Ana ekrana ekle</strong> seçeneğini bul</p>
                            <p style={{margin:0}}>3️⃣ <strong>Yükle</strong> butonuna bas ✅</p>
                        </>)}
                    </div>
                    <button onClick={close} style={{marginTop:25,padding:'14px 40px',borderRadius:10,border:'none',background:'#e50914',color:'#fff',fontWeight:'bold',cursor:'pointer',fontSize:15,width:'100%'}}>Anladım 👍</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{position:'fixed',bottom:20,left:12,right:12,maxWidth:420,margin:'0 auto',zIndex:9999,background:'linear-gradient(135deg,#1a1a1a,#121212)',borderRadius:16,padding:20,border:'1px solid #333',boxShadow:'0 10px 40px rgba(0,0,0,0.5)',animation:'pwaUp .4s ease'}}>
            <button onClick={close} style={{position:'absolute',top:10,right:12,background:'none',border:'none',color:'#666',cursor:'pointer',fontSize:18}}>✕</button>
            <div style={{display:'flex',gap:15,alignItems:'center',marginBottom:15}}>
                <img src="/icon-192x192.png" alt="" style={{width:48,height:48,borderRadius:12}} />
                <div>
                    <h3 style={{margin:0,fontSize:16,color:'#fff'}}>📱 Uygulamayı Yükle</h3>
                    <p style={{margin:0,fontSize:12,color:'#888'}}>Daha hızlı, bildirimlerle!</p>
                </div>
            </div>
            <div style={{display:'flex',gap:6,fontSize:11,color:'#aaa',marginBottom:15,flexWrap:'wrap'}}>
                <span style={{padding:'4px 8px',background:'#222',borderRadius:6}}>⚡ Hızlı</span>
                <span style={{padding:'4px 8px',background:'#222',borderRadius:6}}>🔔 Bildirim</span>
                <span style={{padding:'4px 8px',background:'#222',borderRadius:6}}>📴 Offline</span>
            </div>
            <div style={{display:'flex',gap:10}}>
                <button onClick={install} style={{flex:1,padding:14,borderRadius:10,border:'none',background:'#e50914',color:'#fff',fontSize:15,fontWeight:'bold',cursor:'pointer'}}>
                    Yükle (Ücretsiz)
                </button>
                <button onClick={close} style={{padding:'14px 16px',borderRadius:10,border:'1px solid #444',background:'transparent',color:'#888',fontSize:13,cursor:'pointer'}}>
                    Sonra
                </button>
            </div>
            <style>{`@keyframes pwaUp{from{transform:translateY(100px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        </div>
    );
}
