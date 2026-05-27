import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      {/* Sidebar */}
      <aside style={{ width: "250px", backgroundColor: "#111", color: "white", padding: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "30px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
          <span style={{ color: "#e50914" }}>sanaiyifiyat</span> Panel
        </h2>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link href="/admin" style={{ color: "#ccc", textDecoration: "none", padding: "10px", borderRadius: "5px", transition: "0.2s" }}>
            Dashboard
          </Link>
          <Link href="/admin" style={{ color: "#ccc", textDecoration: "none", padding: "10px", borderRadius: "5px", transition: "0.2s" }}>
            XML Bot (Affiliate)
          </Link>
          <Link href="/" style={{ color: "#ccc", textDecoration: "none", padding: "10px", borderRadius: "5px", transition: "0.2s", marginTop: "20px", borderTop: "1px solid #333", paddingTop: "20px" }}>
            ← Siteye Dön
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px" }}>
        {children}
      </main>
    </div>
  );
}
