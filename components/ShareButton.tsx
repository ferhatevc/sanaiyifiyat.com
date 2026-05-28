"use client";

export default function ShareButton({ title, url }: { title: string, url: string }) {
    async function handleShare() {
        const shareText = `${title} - En ucuz fiyatı sanaiyifiyat.com'da bul!`;
        const shareUrl = `${url}?ref=share`;

        // Native share API (mobilde harika çalışır)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: shareText, url: shareUrl });
                return;
            } catch (e) {
                // Kullanıcı iptal etti, fallback'e düş
            }
        }

        // Fallback: Kopyala
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link kopyalandı! Arkadaşlarınızla paylaşabilirsiniz.");
        } catch (e) {
            // Clipboard de çalışmıyorsa WhatsApp'a yönlendir
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        }
    }

    function shareWhatsApp() {
        const text = `${title} - En ucuz fiyatı bul! ${url}?ref=wa`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }

    function shareTwitter() {
        const text = `${title} en ucuz nerede? 🔍`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url + '?ref=tw')}`, '_blank');
    }

    function shareTelegram() {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url + '?ref=tg')}&text=${encodeURIComponent(title)}`, '_blank');
    }

    return (
        <div style={{display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap'}}>
            <button onClick={handleShare} title="Paylaş"
                style={{padding: '8px 14px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'}}>
                <i className="fa-solid fa-share-nodes"></i> Paylaş
            </button>
            <button onClick={shareWhatsApp} title="WhatsApp"
                style={{padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#25D366', color: '#fff', cursor: 'pointer', fontSize: '15px'}}>
                <i className="fa-brands fa-whatsapp"></i>
            </button>
            <button onClick={shareTwitter} title="Twitter"
                style={{padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#1DA1F2', color: '#fff', cursor: 'pointer', fontSize: '15px'}}>
                <i className="fa-brands fa-twitter"></i>
            </button>
            <button onClick={shareTelegram} title="Telegram"
                style={{padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#0088cc', color: '#fff', cursor: 'pointer', fontSize: '15px'}}>
                <i className="fa-brands fa-telegram"></i>
            </button>
        </div>
    );
}
