import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin panelini koruma
  if (pathname.startsWith("/admin")) {
    const adminAuth = request.cookies.get("admin_auth")?.value;
    
    if (adminAuth !== "authenticated") {
      // Basit bir login mekanizması — URL'ye ?key=ADMIN_SECRET ile giriş
      const key = request.nextUrl.searchParams.get("key");
      const adminSecret = process.env.ADMIN_SECRET || "sanaiyifiyat2026";
      
      if (key === adminSecret) {
        const response = NextResponse.redirect(new URL("/admin", request.url));
        response.cookies.set("admin_auth", "authenticated", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 24 saat
          path: "/",
        });
        return response;
      }
      
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><title>Admin Girişi - Sana İyi Fiyat</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#121212;font-family:Inter,sans-serif;">
          <div style="text-align:center;color:#fff;">
            <h1 style="font-size:48px;margin-bottom:10px;">🔒</h1>
            <h2 style="margin-bottom:20px;">Admin Paneli</h2>
            <p style="color:#aaa;">Bu alan yetkili kullanıcılara özeldir.</p>
            <form method="GET" style="margin-top:20px;">
              <input type="password" name="key" placeholder="Admin Şifresi" 
                style="padding:12px 20px;border-radius:8px;border:1px solid #444;background:#222;color:#fff;font-size:16px;width:250px;"/>
              <button type="submit" 
                style="padding:12px 20px;border-radius:8px;border:none;background:#e50914;color:#fff;font-size:16px;cursor:pointer;margin-left:10px;">
                Giriş
              </button>
            </form>
          </div>
        </body>
        </html>`,
        { status: 401, headers: { "Content-Type": "text/html" } }
      );
    }
  }

  // Seed ve Migrate API'lerini koruma (sadece admin_auth cookie ile erişilebilir)
  if (pathname.startsWith("/api/seed") || pathname.startsWith("/api/migrate")) {
    const adminAuth = request.cookies.get("admin_auth")?.value;
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/seed/:path*", "/api/seed-real/:path*", "/api/migrate/:path*"],
};
