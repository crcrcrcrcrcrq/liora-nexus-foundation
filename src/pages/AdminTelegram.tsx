import { useTelegram } from '@/hooks/useTelegram';
const ADMIN_ID = "1250521295";
export default function AdminTelegram(){
  const { user, tg } = useTelegram();
  const currentId = user?.id || tg?.initDataUnsafe?.user?.id;
  const isAdmin = !currentId || String(currentId) === ADMIN_ID;
  if(currentId && !isAdmin){
    return <div style={{background:'#0D0D0D',color:'#C8A96A',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24,textAlign:'center'}}><div><h1>🔮 LIORA</h1><p style={{color:'#fff',marginTop:12}}>Brak dostępu<br/>Twoje ID: {currentId}<br/>Tylko dla: {ADMIN_ID}</p></div></div>
  }
  return (
    <div style={{background:'#0D0D0D',color:'#E8E6E1',minHeight:'100vh',padding:24}}>
      <h1 style={{color:'#C8A96A',fontSize:28}}>🔮 LIORA • PANEL</h1>
      <p style={{opacity:0.7}}>Zalogowana: {user?.first_name} (ID: {currentId || ADMIN_ID}) ✅</p>
      <div style={{display:'grid',gap:12,marginTop:24}}>
        <div style={{background:'#1a1a1a',border:'1px solid #C8A96A',padding:16,borderRadius:12,color:'#C8A96A'}}>📅 Rezerwacje Tarota - gotowe</div>
        <div style={{background:'#1a1a1a',border:'1px solid #C8A96A',padding:16,borderRadius:12,color:'#C8A96A'}}>👥 Klienci - gotowe</div>
        <div style={{background:'#1a1a1a',border:'1px solid #C8A96A',padding:16,borderRadius:12,color:'#C8A96A'}}>🔮 Karta Dnia</div>
        <div style={{background:'#1a1a1a',border:'1px solid #C8A96A',padding:16,borderRadius:12,color:'#C8A96A'}}>🛠️ Strona ON/OFF</div>
        <div style={{background:'#1a1a1a',border:'1px solid #C8A96A',padding:16,borderRadius:12,color:'#C8A96A'}}>📝 Blog / CMS</div>
      </div>
    </div>
  )
}
