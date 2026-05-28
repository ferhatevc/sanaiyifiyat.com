import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sana İyi Fiyat - En Ucuzunu Bul",
  description: "Türkiye'nin en gelişmiş, modern ve hızlı fiyat karşılaştırma platformu.",
  manifest: "/manifest.json",
  themeColor: "#E50914",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SanaİyiFiyat",
  },
  other: {
    "verify-admitad": "12669fb7d1",
    "mobile-web-app-capable": "yes",
  }
};

import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import MobileMenu from "@/components/MobileMenu";
import CompareBar from "@/components/CompareBar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="tr">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <header className="glass-header">
            <div className="custom-container header-container">
                <Link href="/" className="logo">
                    <span className="logo-icon"><i className="fa-solid fa-tags"></i></span>
                    <span className="logo-text">sana<span className="highlight">iyifiyat</span>.com</span>
                </Link>
                <form action="/search" method="GET" className="search-bar">
                    <input type="text" name="q" placeholder="Ürün, kategori veya marka ara (Örn: iPhone 15, Dyson...)" required />
                    <button type="submit" className="search-btn"><i className="fa-solid fa-magnifying-glass"></i></button>
                </form>
                <nav className="header-nav">
                    <Link href="#" className="nav-link"><i className="fa-regular fa-bell"></i> Fiyat Alarmlarım</Link>
                    {session ? (
                      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <span style={{color: '#fff', fontSize: '14px'}}><i className="fa-regular fa-circle-user"></i> {session.name}</span>
                        <LogoutButton />
                      </div>
                    ) : (
                      <Link href="/login" className="nav-link"><i className="fa-regular fa-user"></i> Giriş Yap</Link>
                    )}
                </nav>
                <MobileMenu />
            </div>
        </header>

        {children}

        <CompareBar />
        <PWAInstallPrompt />

        <footer>
            <div className="custom-container footer-content">
                <div className="footer-logo">
                    <Link href="/" className="logo">
                        <span className="logo-icon"><i className="fa-solid fa-tags"></i></span>
                        <span className="logo-text">sana<span className="highlight">iyifiyat</span>.com</span>
                    </Link>
                    <p>Türkiye'nin en gelişmiş, modern ve hızlı fiyat karşılaştırma platformu. Aradığınız ürünün en uygun fiyatını anında bulun.</p>
                </div>
                <div className="footer-links">
                    <h4>Hakkımızda</h4>
                    <Link href="#">Biz Kimiz?</Link>
                    <Link href="#">İletişim</Link>
                    <Link href="#">Kariyer</Link>
                </div>
                <div className="footer-links">
                    <h4>Mağazalar İçin</h4>
                    <Link href="#">Mağaza Girişi</Link>
                    <Link href="#">Mağaza Aç</Link>
                    <Link href="#">XML Entegrasyonu</Link>
                </div>
                <div className="footer-links">
                    <h4>Yasal</h4>
                    <Link href="#">Kullanım Koşulları</Link>
                    <Link href="#">Gizlilik Politikası</Link>
                    <Link href="#">Çerez Politikası</Link>
                </div>
            </div>
        </footer>
      </body>
    </html>
  );
}
