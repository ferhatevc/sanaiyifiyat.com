"use client";
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceHistoryChart({ currentPrice }: { currentPrice: number }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prototip için mock fiyat geçmişi verisi (Gerçekte veritabanından çekilecek)
  const data = [
    { name: 'Ocak', fiyat: Math.round(currentPrice * 1.15) },
    { name: 'Şubat', fiyat: Math.round(currentPrice * 1.10) },
    { name: 'Mart', fiyat: Math.round(currentPrice * 1.12) },
    { name: 'Nisan', fiyat: Math.round(currentPrice * 1.05) },
    { name: 'Mayıs', fiyat: Math.round(currentPrice * 1.02) },
    { name: 'Bugün', fiyat: currentPrice },
  ];

  if (!isMounted) return <div style={{height: 300, width: '100%', backgroundColor: '#1a1a1a', borderRadius: 8, marginTop: 20}}></div>;

  return (
    <div style={{ width: '100%', height: 350, marginTop: 30, backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
      <h3 style={{ marginBottom: 20, fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <i className="fa-solid fa-chart-line" style={{color: '#e50914'}}></i> Son 6 Aylık Fiyat Değişimi
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <Line type="monotone" dataKey="fiyat" stroke="#e50914" strokeWidth={3} dot={{ r: 5, fill: '#e50914' }} activeDot={{ r: 8 }} />
          <CartesianGrid stroke="#333" strokeDasharray="5 5" vertical={false} />
          <XAxis dataKey="name" stroke="#aaa" tickMargin={10} />
          <YAxis stroke="#aaa" domain={['dataMin - (dataMin * 0.05)', 'dataMax + (dataMax * 0.05)']} tickFormatter={(val) => `${val.toLocaleString()} ₺`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#121212', border: '1px solid #444', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#e50914', fontWeight: 'bold', fontSize: '16px' }}
            formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR')} TL`, 'Fiyat']}
            labelStyle={{ color: '#aaa', marginBottom: '5px' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
