import { useLocation, useNavigate } from 'react-router-dom'

const LOGO = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwZDE1MjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA3MGIxNjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Im5lc3RHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZlZTdiNztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2I4MmY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iY2hhcnRHcmFkIiB4MT0iMCUiIHkxPSIxMDAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzgxOGNmODtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmVlN2I3O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYXJlYUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZlZTdiNztzdG9wLW9wYWNpdHk6MC4xOCIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmVlN2I3O3N0b3Atb3BhY2l0eTowIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxmaWx0ZXIgaWQ9Imdsb3ciPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyLjUiIHJlc3VsdD0iY29sb3JlZEJsdXIiLz4KICAgICAgPGZlTWVyZ2U+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJjb2xvcmVkQmx1ciIvPgogICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgICA8L2ZlTWVyZ2U+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9InNvZnRHbG93Ij4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNyIgcmVzdWx0PSJjb2xvcmVkQmx1ciIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImNvbG9yZWRCbHVyIi8+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJTb3VyY2VHcmFwaGljIi8+CiAgICAgIDwvZmVNZXJnZT4KICAgIDwvZmlsdGVyPgogICAgPGNsaXBQYXRoIGlkPSJuZXN0Q2xpcCI+CiAgICAgIDxlbGxpcHNlIGN4PSIyMDAiIGN5PSIyMTgiIHJ4PSI4OCIgcnk9IjQyIi8+CiAgICA8L2NsaXBQYXRoPgogIDwvZGVmcz4KCiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxODAiIGZpbGw9InVybCgjYmdHcmFkKSIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMTgwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTEwLDIzMSwxODMsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KCiAgPGVsbGlwc2UgY3g9IjIwMCIgY3k9IjIzMCIgcng9IjExMCIgcnk9IjM1IiBmaWxsPSJyZ2JhKDExMCwyMzEsMTgzLDAuMDUpIiBmaWx0ZXI9InVybCgjc29mdEdsb3cpIi8+CgogIDxnIGNsaXAtcGF0aD0idXJsKCNuZXN0Q2xpcCkiPgogICAgPHBhdGggZD0iTSAxMzAgMjQ1IEwgMTQ4IDIzMiBMIDE2NiAyMzggTCAxODQgMjIyIEwgMjAyIDIxMCBMIDIyMiAyMDAgTCAyNDAgMTkwIEwgMjQwIDI1NSBMIDEzMCAyNTUgWiIKICAgICAgZmlsbD0idXJsKCNhcmVhR3JhZCkiLz4KICAgIDxwb2x5bGluZQogICAgICBwb2ludHM9IjEzMCwyNDUgMTQ4LDIzMiAxNjYsMjM4IDE4NCwyMjIgMjAyLDIxMCAyMjIsMjAwIDI0MCwxOTAiCiAgICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNjaGFydEdyYWQpIiBzdHJva2Utd2lkdGg9IjIuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWx0ZXI9InVybCgjZ2xvdykiLz4KICAgIDxjaXJjbGUgY3g9IjEzMCIgY3k9IjI0NSIgcj0iMyIgZmlsbD0iIzgxOGNmOCIvPgogICAgPGNpcmNsZSBjeD0iMTQ4IiBjeT0iMjMyIiByPSIzIiBmaWxsPSIjODE4Y2Y4Ii8+CiAgICA8Y2lyY2xlIGN4PSIxNjYiIGN5PSIyMzgiIHI9IjMiIGZpbGw9IiM4MThjZjgiLz4KICAgIDxjaXJjbGUgY3g9IjE4NCIgY3k9IjIyMiIgcj0iMyIgZmlsbD0iIzZlZTdiNyIvPgogICAgPGNpcmNsZSBjeD0iMjAyIiBjeT0iMjEwIiByPSIzIiBmaWxsPSIjNmVlN2I3Ii8+CiAgICA8Y2lyY2xlIGN4PSIyMjIiIGN5PSIyMDAiIHI9IjMiIGZpbGw9IiM2ZWU3YjciLz4KICAgIDxjaXJjbGUgY3g9IjI0MCIgY3k9IjE5MCIgcj0iNSIgZmlsbD0iIzZlZTdiNyIgZmlsdGVyPSJ1cmwoI3NvZnRHbG93KSIvPgogICAgPGNpcmNsZSBjeD0iMjQwIiBjeT0iMTkwIiByPSIyLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjk1Ii8+CiAgPC9nPgoKICA8cGF0aCBkPSJNIDk1IDI1MiBRIDIwMCAzMTggMzA1IDI1MiIKICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNy41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbHRlcj0idXJsKCNnbG93KSIgb3BhY2l0eT0iMC45NSIvPgogIDxwYXRoIGQ9Ik0gMTE0IDIzMiBRIDIwMCAyOTIgMjg2IDIzMiIKICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWx0ZXI9InVybCgjZ2xvdykiIG9wYWNpdHk9IjAuNzUiLz4KICA8cGF0aCBkPSJNIDEzNSAyMTUgUSAyMDAgMjY4IDI2NSAyMTUiCiAgICBmaWxsPSJub25lIiBzdHJva2U9InVybCgjbmVzdEdyYWQpIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsdGVyPSJ1cmwoI2dsb3cpIiBvcGFjaXR5PSIwLjUiLz4KICA8cGF0aCBkPSJNIDk1IDI1MiBRIDg3IDIzNCAxMTQgMjMyIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjbmVzdEdyYWQpIiBzdHJva2Utd2lkdGg9IjUuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjgiLz4KICA8cGF0aCBkPSJNIDMwNSAyNTIgUSAzMTMgMjM0IDI4NiAyMzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjAuOCIvPgoKICA8dGV4dCB4PSIyMDAiIHk9IjMxOCIKICAgIGZvbnQtZmFtaWx5PSInU29yYScsICdJbnRlcicsIHNhbnMtc2VyaWYiCiAgICBmb250LXNpemU9IjQ0IgogICAgZm9udC13ZWlnaHQ9IjgwMCIKICAgIHRleHQtYW5jaG9yPSJtaWRkbGUiCiAgICBsZXR0ZXItc3BhY2luZz0iLTEiCiAgICBmaWxsPSJ3aGl0ZSI+CiAgICBOZXN0PHRzcGFuIGZpbGw9InVybCgjbmVzdEdyYWQpIj5GaTwvdHNwYW4+CiAgPC90ZXh0PgoKICA8dGV4dCB4PSIyMDAiIHk9IjM0NCIKICAgIGZvbnQtZmFtaWx5PSInU29yYScsICdJbnRlcicsIHNhbnMtc2VyaWYiCiAgICBmb250LXNpemU9IjEyIgogICAgZm9udC13ZWlnaHQ9IjQwMCIKICAgIHRleHQtYW5jaG9yPSJtaWRkbGUiCiAgICBsZXR0ZXItc3BhY2luZz0iMy41IgogICAgZmlsbD0icmdiYSgyMjYsMjMyLDI0MCwwLjMpIj4KICAgIElOREVQRU5Ew4pOQ0lBIEZBTUlMSUFSCiAgPC90ZXh0PgoKPC9zdmc+Cg==`

const NAV_LEFT = [
  { path:'/proventos', label:'Proventos', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { path:'/investimentos', label:'Invest.', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { path:'/despesas', label:'Despesas', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
]
const NAV_RIGHT = [
  { path:'/assinaturas', label:'Assin.', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
  { path:'/financiamentos', label:'Financ.', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { path:'/patrimonio', label:'Patrimônio', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const NavBtn = ({ item }) => {
    const active = location.pathname === item.path
    return (
      <button onClick={() => navigate(item.path)} className="btn-press" style={{
        background:'none', border:'none', cursor:'pointer',
        display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
        padding:'4px 6px', minWidth:'40px',
        color: active ? '#6ee7b7' : 'rgba(226,232,240,0.35)',
        position:'relative',
      }}>
        {active && <span style={{ position:'absolute', top:'-8px', left:'50%', transform:'translateX(-50%)', width:'20px', height:'2px', background:'linear-gradient(90deg,#6ee7b7,#818cf8)', borderRadius:'0 0 2px 2px', boxShadow:'0 0 8px rgba(110,231,183,0.6)' }} />}
        <span style={{ filter: active ? 'drop-shadow(0 0 6px rgba(110,231,183,0.7))' : 'none', transition:'all 0.2s', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
          {item.icon}
        </span>
        <span style={{ fontSize:'9px', fontWeight: active ? 700 : 400, letterSpacing:'0.03em' }}>{item.label}</span>
      </button>
    )
  }

  return (
    <nav style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:100,
      background:'rgba(7,11,22,0.96)', backdropFilter:'blur(24px)',
      borderTop:'1px solid rgba(255,255,255,0.06)',
      paddingTop:'8px', paddingBottom:'max(12px, env(safe-area-inset-bottom))',
      boxShadow:'0 -1px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display:'flex', justifyContent:'space-around', alignItems:'flex-start' }}>
        {NAV_LEFT.map(item => <NavBtn key={item.path} item={item} />)}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'4px 6px', minWidth:'40px' }}>
          <img src={LOGO} alt="NestFi" style={{ width:'28px', height:'28px', borderRadius:'8px', opacity:0.8 }} />
          <span style={{ fontSize:'9px', color:'rgba(226,232,240,0.2)', letterSpacing:'0.03em' }}>NestFi</span>
        </div>
        {NAV_RIGHT.map(item => <NavBtn key={item.path} item={item} />)}
      </div>
    </nav>
  )
}
