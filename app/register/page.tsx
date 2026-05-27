"use client";
import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await registerUser(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  }

  return (
    <main className="custom-container" style={{paddingTop: '60px', paddingBottom: '60px', display: 'flex', justifyContent: 'center'}}>
      <div style={{width: '100%', maxWidth: '400px', backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <Link href="/" className="logo" style={{justifyContent: 'center', marginBottom: '20px'}}>
                <span className="logo-icon"><i className="fa-solid fa-tags"></i></span>
                <span className="logo-text" style={{fontSize: '24px'}}>sana<span className="highlight">iyifiyat</span>.com</span>
            </Link>
            <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#fff'}}>Yeni Hesap Oluştur</h1>
            <p style={{color: '#aaa', marginTop: '10px', fontSize: '14px'}}>Fiyat alarmları kurmak için ücretsiz katılın.</p>
        </div>

        {error && (
            <div style={{backgroundColor: 'rgba(229, 9, 20, 0.1)', border: '1px solid #e50914', color: '#e50914', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px'}}>
                <i className="fa-solid fa-circle-exclamation" style={{marginRight: '8px'}}></i> {error}
            </div>
        )}

        <form action={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px'}}>Ad Soyad</label>
                <input type="text" name="name" required style={{width: '100%', padding: '12px 15px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', fontSize: '16px', outline: 'none'}} />
            </div>
            <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px'}}>E-posta Adresi</label>
                <input type="email" name="email" required style={{width: '100%', padding: '12px 15px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', fontSize: '16px', outline: 'none'}} />
            </div>
            <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px'}}>Şifre</label>
                <input type="password" name="password" required style={{width: '100%', padding: '12px 15px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', fontSize: '16px', outline: 'none'}} />
            </div>
            
            <button type="submit" disabled={isLoading} className="compare-btn" style={{width: '100%', padding: '15px', fontSize: '16px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1}}>
                {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
            </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '30px', color: '#888', fontSize: '14px'}}>
            Zaten hesabınız var mı? <Link href="/login" style={{color: '#e50914', textDecoration: 'none', fontWeight: 'bold'}}>Giriş Yapın</Link>
        </div>
      </div>
    </main>
  );
}
