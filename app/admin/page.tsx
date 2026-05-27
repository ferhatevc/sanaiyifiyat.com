import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const feeds = await prisma.affiliateFeed.findMany({
    orderBy: { createdAt: "desc" }
  });

  const productCount = await prisma.product.count();
  const offerCount = await prisma.offer.count();

  // Server Action: Yeni Feed Ekle
  async function addFeed(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const vendor = formData.get("vendor") as string;
    const url = formData.get("url") as string;

    if (name && vendor && url) {
      await prisma.affiliateFeed.create({
        data: { name, vendor, url }
      });
      revalidatePath("/admin");
    }
  }

  // Server Action: Feed Sil
  async function deleteFeed(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.affiliateFeed.delete({ where: { id } });
    revalidatePath("/admin");
  }

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px", color: "#111" }}>XML Entegrasyon Paneli</h1>
      
      <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", flex: 1 }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>Toplam Ürün</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#111" }}>{productCount.toLocaleString('tr-TR')}</p>
        </div>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", flex: 1 }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>Toplam Teklif</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#e50914" }}>{offerCount.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Yeni XML Bağlantısı Ekle</h2>
        
        <form action={addFeed} style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Ağ Adı (Örn: GelirOrtakları)</label>
            <input type="text" name="name" required style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Satıcı Adı (Örn: Trendyol)</label>
            <input type="text" name="vendor" required style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>XML Linki (URL)</label>
            <input type="url" name="url" required style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} placeholder="https://..." />
          </div>
          <button type="submit" style={{ backgroundColor: "#111", color: "white", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold", height: "40px" }}>Ekle</button>
        </form>
      </div>

      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Kayıtlı XML Botları</h2>
        
        {feeds.length === 0 ? (
          <p style={{ color: "#666" }}>Henüz hiç XML linki eklenmedi.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #eee" }}>
                <th style={{ padding: "12px", color: "#666" }}>Ağ Adı</th>
                <th style={{ padding: "12px", color: "#666" }}>Satıcı</th>
                <th style={{ padding: "12px", color: "#666" }}>Durum</th>
                <th style={{ padding: "12px", color: "#666" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map(feed => (
                <tr key={feed.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontWeight: "500" }}>{feed.name}</td>
                  <td style={{ padding: "12px" }}>{feed.vendor}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px", 
                      fontWeight: "bold",
                      backgroundColor: feed.status === 'success' ? '#def7ec' : feed.status === 'syncing' ? '#e1effe' : '#fef3c7',
                      color: feed.status === 'success' ? '#03543f' : feed.status === 'syncing' ? '#1e429f' : '#92400e'
                    }}>
                      {feed.status === 'idle' ? 'Bekliyor' : feed.status === 'syncing' ? 'Senkronize Ediliyor...' : 'Başarılı'}
                    </span>
                  </td>
                  <td style={{ padding: "12px", display: "flex", gap: "10px" }}>
                    <form action={`/api/sync-feed`} method="POST" target="_blank">
                      <input type="hidden" name="id" value={feed.id} />
                      <button type="submit" style={{ backgroundColor: "#e50914", color: "white", padding: "6px 12px", borderRadius: "5px", border: "none", cursor: "pointer", fontSize: "13px" }}>
                        Botu Çalıştır
                      </button>
                    </form>
                    <form action={deleteFeed}>
                      <input type="hidden" name="id" value={feed.id} />
                      <button type="submit" style={{ backgroundColor: "transparent", color: "#666", padding: "6px 12px", borderRadius: "5px", border: "1px solid #ccc", cursor: "pointer", fontSize: "13px" }}>
                        Sil
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
