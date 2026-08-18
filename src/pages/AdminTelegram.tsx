import { useTelegram } from '@/hooks/useTelegram';
import { telegramControl } from '@/services/api';

export default function AdminTelegram() {
  const { isAdmin, user } = useTelegram();

  if (!isAdmin) return <div style={{background:'#0D0D0D', color:'#C8A96A', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Brak dostępu - {user?.id}</div>;

  return (
    <div style={{background:'#0D0D0D', color:'#C8A96A', minHeight:'100vh', padding:'20px', fontFamily:'Cormorant Garamond'}}>
      <h1 style={{color:'#C8A96A'}}>LIORA • PANEL TELEGRAM</h1>
      <p>Witaj {user?.firstName} • Full Control</p>
      
      <div style={{display:'grid', gap:'12px', marginTop:'20px'}}>
        <button onClick={()=>telegramControl.action('get_bookings')} style={btn}>📅 Rezerwacje Tarota</button>
        <button onClick={()=>telegramControl.action('get_users')} style={btn}>👥 Klienci</button>
        <button onClick={()=>telegramControl.action('set_daily_card')} style={btn}>🔮 Ustaw Kartę Dnia</button>
        <button onClick={()=>telegramControl.action('toggle_maintenance')} style={btn}>🛠️ Włącz / Wyłącz stronę</button>
        <button onClick={()=>telegramControl.action('publish_post')} style={btn}>📝 Blog / CMS</button>
        <button onClick={()=>telegramControl.action('get_stats')} style={btn}>📊 Statystyki</button>
      </div>
    </div>
  );
}
const btn = {background:'rgba(200,169,106,0.1)', border:'1px solid #C8A96A', color:'#C8A96A', padding:'16px', borderRadius:'12px', fontSize:'16px'} as const;
