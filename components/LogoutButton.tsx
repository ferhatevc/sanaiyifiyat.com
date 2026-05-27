"use client";
import { logoutUser } from "@/app/actions/auth";

export default function LogoutButton() {
    return (
        <button 
            onClick={() => logoutUser()} 
            style={{background: 'none', border: 'none', color: '#e50914', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'}}
        >
            Çıkış
        </button>
    );
}
