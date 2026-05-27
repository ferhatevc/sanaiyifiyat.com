import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function GoToVendorPage({ params }: { params: Promise<{ offerId: string }> }) {
    const resolvedParams = await params;
    const offerId = resolvedParams.offerId;

    const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        include: { product: true }
    });

    if (!offer) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: '#fff'}}>
                <h2>Teklif bulunamadı veya süresi dolmuş.</h2>
            </div>
        );
    }

    // Gerçek bir sistemde burada "Tıklama (Click)" loglaması yapılır (Analytics).
    // await prisma.clickLog.create({ data: { offerId: offer.id, userId: ... } })

    // Affiliate parametresi ekleme algoritması
    let affiliateUrl = offer.url;

    // --- TEST ORTAMI İÇİN KESİN ÇÖZÜM ---
    // Sadece /mock değil, XML içerisindeki /iphone-15 veya /ps5 gibi sahte yollar da mağazalarda 404 veriyor.
    // Bu yüzden test aşamasında olduğumuz için kullanıcının linkindeki sadece "Domain" kısmını (Örn: https://www.trendyol.com) alıyoruz.
    try {
        const urlObj = new URL(offer.url);
        const affiliateParam = "aff_id=SANA_IYI_FIYAT&utm_source=sanaiyifiyat&utm_medium=affiliate";
        affiliateUrl = `${urlObj.origin}?${affiliateParam}`;
    } catch (error) {
        // URL hatalıysa direkt anasayfaya at
        affiliateUrl = "https://www.trendyol.com/?aff_id=SANA_IYI_FIYAT";
    }

    return (
        <main style={{
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            backgroundColor: '#121212', 
            color: '#fff',
            fontFamily: 'sans-serif'
        }}>
            
            <div style={{
                width: '80px', 
                height: '80px', 
                border: '4px solid rgba(229, 9, 20, 0.2)', 
                borderTopColor: '#e50914', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                marginBottom: '30px'
            }}></div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 
                    to { transform: rotate(360deg); } 
                }
            `}} />

            <h1 style={{fontSize: '24px', marginBottom: '10px'}}>Güvenle Yönlendiriliyorsunuz...</h1>
            <p style={{color: '#aaa', fontSize: '16px'}}>
                <strong style={{color: '#fff'}}>{offer.vendor}</strong> mağazasına aktarılıyorsunuz.
            </p>

            <div style={{marginTop: '40px', padding: '15px 30px', backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #333', textAlign: 'center'}}>
                <div style={{fontSize: '14px', color: '#888', marginBottom: '5px'}}>Aranan Ürün</div>
                <div style={{color: '#fff', fontWeight: 'bold'}}>{offer.product.title}</div>
            </div>

            {/* Otomatik yönlendirme betiği (Kullanıcı 1.5 saniye animasyonu görsün diye timeout konulur) */}
            <script dangerouslySetInnerHTML={{__html: `
                setTimeout(function() {
                    window.location.href = "${affiliateUrl}";
                }, 1500);
            `}} />
            
        </main>
    );
}
