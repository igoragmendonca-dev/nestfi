import { useState } from 'react'

const LOGO = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwZDE1MjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA3MGIxNjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Im5lc3RHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZlZTdiNztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2I4MmY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iY2hhcnRHcmFkIiB4MT0iMCUiIHkxPSIxMDAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzgxOGNmODtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmVlN2I3O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYXJlYUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZlZTdiNztzdG9wLW9wYWNpdHk6MC4xOCIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmVlN2I3O3N0b3Atb3BhY2l0eTowIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxmaWx0ZXIgaWQ9Imdsb3ciPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyLjUiIHJlc3VsdD0iY29sb3JlZEJsdXIiLz4KICAgICAgPGZlTWVyZ2U+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJjb2xvcmVkQmx1ciIvPgogICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgICA8L2ZlTWVyZ2U+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9InNvZnRHbG93Ij4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNyIgcmVzdWx0PSJjb2xvcmVkQmx1ciIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImNvbG9yZWRCbHVyIi8+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJTb3VyY2VHcmFwaGljIi8+CiAgICAgIDwvZmVNZXJnZT4KICAgIDwvZmlsdGVyPgogICAgPGNsaXBQYXRoIGlkPSJuZXN0Q2xpcCI+CiAgICAgIDxlbGxpcHNlIGN4PSIyMDAiIGN5PSIyMTgiIHJ4PSI4OCIgcnk9IjQyIi8+CiAgICA8L2NsaXBQYXRoPgogIDwvZGVmcz4KCiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxODAiIGZpbGw9InVybCgjYmdHcmFkKSIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMTgwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTEwLDIzMSwxODMsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KCiAgPGVsbGlwc2UgY3g9IjIwMCIgY3k9IjIzMCIgcng9IjExMCIgcnk9IjM1IiBmaWxsPSJyZ2JhKDExMCwyMzEsMTgzLDAuMDUpIiBmaWx0ZXI9InVybCgjc29mdEdsb3cpIi8+CgogIDxnIGNsaXAtcGF0aD0idXJsKCNuZXN0Q2xpcCkiPgogICAgPHBhdGggZD0iTSAxMzAgMjQ1IEwgMTQ4IDIzMiBMIDE2NiAyMzggTCAxODQgMjIyIEwgMjAyIDIxMCBMIDIyMiAyMDAgTCAyNDAgMTkwIEwgMjQwIDI1NSBMIDEzMCAyNTUgWiIKICAgICAgZmlsbD0idXJsKCNhcmVhR3JhZCkiLz4KICAgIDxwb2x5bGluZQogICAgICBwb2ludHM9IjEzMCwyNDUgMTQ4LDIzMiAxNjYsMjM4IDE4NCwyMjIgMjAyLDIxMCAyMjIsMjAwIDI0MCwxOTAiCiAgICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNjaGFydEdyYWQpIiBzdHJva2Utd2lkdGg9IjIuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWx0ZXI9InVybCgjZ2xvdykiLz4KICAgIDxjaXJjbGUgY3g9IjEzMCIgY3k9IjI0NSIgcj0iMyIgZmlsbD0iIzgxOGNmOCIvPgogICAgPGNpcmNsZSBjeD0iMTQ4IiBjeT0iMjMyIiByPSIzIiBmaWxsPSIjODE4Y2Y4Ii8+CiAgICA8Y2lyY2xlIGN4PSIxNjYiIGN5PSIyMzgiIHI9IjMiIGZpbGw9IiM4MThjZjgiLz4KICAgIDxjaXJjbGUgY3g9IjE4NCIgY3k9IjIyMiIgcj0iMyIgZmlsbD0iIzZlZTdiNyIvPgogICAgPGNpcmNsZSBjeD0iMjAyIiBjeT0iMjEwIiByPSIzIiBmaWxsPSIjNmVlN2I3Ii8+CiAgICA8Y2lyY2xlIGN4PSIyMjIiIGN5PSIyMDAiIHI9IjMiIGZpbGw9IiM2ZWU3YjciLz4KICAgIDxjaXJjbGUgY3g9IjI0MCIgY3k9IjE5MCIgcj0iNSIgZmlsbD0iIzZlZTdiNyIgZmlsdGVyPSJ1cmwoI3NvZnRHbG93KSIvPgogICAgPGNpcmNsZSBjeD0iMjQwIiBjeT0iMTkwIiByPSIyLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjk1Ii8+CiAgPC9nPgoKICA8cGF0aCBkPSJNIDk1IDI1MiBRIDIwMCAzMTggMzA1IDI1MiIKICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNy41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbHRlcj0idXJsKCNnbG93KSIgb3BhY2l0eT0iMC45NSIvPgogIDxwYXRoIGQ9Ik0gMTE0IDIzMiBRIDIwMCAyOTIgMjg2IDIzMiIKICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWx0ZXI9InVybCgjZ2xvdykiIG9wYWNpdHk9IjAuNzUiLz4KICA8cGF0aCBkPSJNIDEzNSAyMTUgUSAyMDAgMjY4IDI2NSAyMTUiCiAgICBmaWxsPSJub25lIiBzdHJva2U9InVybCgjbmVzdEdyYWQpIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsdGVyPSJ1cmwoI2dsb3cpIiBvcGFjaXR5PSIwLjUiLz4KICA8cGF0aCBkPSJNIDk1IDI1MiBRIDg3IDIzNCAxMTQgMjMyIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjbmVzdEdyYWQpIiBzdHJva2Utd2lkdGg9IjUuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjgiLz4KICA8cGF0aCBkPSJNIDMwNSAyNTIgUSAzMTMgMjM0IDI4NiAyMzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjAuOCIvPgoKICA8dGV4dCB4PSIyMDAiIHk9IjMxOCIKICAgIGZvbnQtZmFtaWx5PSInU29yYScsICdJbnRlcicsIHNhbnMtc2VyaWYiCiAgICBmb250LXNpemU9IjQ0IgogICAgZm9udC13ZWlnaHQ9IjgwMCIKICAgIHRleHQtYW5jaG9yPSJtaWRkbGUiCiAgICBsZXR0ZXItc3BhY2luZz0iLTEiCiAgICBmaWxsPSJ3aGl0ZSI+CiAgICBOZXN0PHRzcGFuIGZpbGw9InVybCgjbmVzdEdyYWQpIj5GaTwvdHNwYW4+CiAgPC90ZXh0PgoKICA8dGV4dCB4PSIyMDAiIHk9IjM0NCIKICAgIGZvbnQtZmFtaWx5PSInU29yYScsICdJbnRlcicsIHNhbnMtc2VyaWYiCiAgICBmb250LXNpemU9IjEyIgogICAgZm9udC13ZWlnaHQ9IjQwMCIKICAgIHRleHQtYW5jaG9yPSJtaWRkbGUiCiAgICBsZXR0ZXItc3BhY2luZz0iMy41IgogICAgZmlsbD0icmdiYSgyMjYsMjMyLDI0MCwwLjMpIj4KICAgIElOREVQRU5Ew4pOQ0lBIEZBTUlMSUFSCiAgPC90ZXh0PgoKPC9zdmc+Cg==`

const SENHA_CORRETA = 'nestfi2025'
const STORAGE_KEY   = 'nestfi-auth'

export function isAutenticado() {
  return localStorage.getItem(STORAGE_KEY) === 'ok'
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

export default function LoginScreen({ onLogin }) {
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [mostrar, setMostrar] = useState(false)

  const tentar = () => {
    setLoading(true)
    setTimeout(() => {
      if (senha === SENHA_CORRETA) {
        localStorage.setItem(STORAGE_KEY, 'ok')
        onLogin()
      } else {
        setErro(true)
        setSenha('')
        setLoading(false)
        setTimeout(() => setErro(false), 2000)
      }
    }, 400)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#070b16', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-100px', left:'50%', transform:'translateX(-50%)', width:'400px', height:'400px', background:'radial-gradient(circle,rgba(110,231,183,0.07) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ animation:'fadeUp 0.6s ease both', marginBottom:'32px', textAlign:'center' }}>
        <img src={LOGO} alt="NestFi" style={{ width:'100px', height:'100px', borderRadius:'24px', marginBottom:'16px', boxShadow:'0 8px 32px rgba(110,231,183,0.2)' }} />
        <p style={{ fontSize:'13px', color:'rgba(226,232,240,0.35)', letterSpacing:'0.2em', textTransform:'uppercase' }}>Acesso Privado</p>
      </div>
      <div style={{ width:'100%', maxWidth:'340px', background:'linear-gradient(135deg,#111827,#0d1220)', border:`1px solid ${erro?'rgba(248,113,113,0.3)':'rgba(110,231,183,0.12)'}`, borderRadius:'24px', padding:'28px 24px', boxShadow:'0 24px 64px rgba(0,0,0,0.5)', animation:'fadeUp 0.6s ease 0.1s both', transition:'border-color 0.3s' }}>
        <p style={{ fontSize:'18px', fontWeight:700, color:'#e2e8f0', marginBottom:'6px' }}>Bem-vindo</p>
        <p style={{ fontSize:'13px', color:'rgba(226,232,240,0.4)', marginBottom:'24px' }}>Digite a senha para acessar o NestFi</p>
        <div style={{ position:'relative', marginBottom:'16px' }}>
          <input
            type={mostrar?'text':'password'}
            value={senha}
            onChange={e=>{ setSenha(e.target.value); setErro(false) }}
            onKeyDown={e=>e.key==='Enter'&&tentar()}
            placeholder="Senha"
            autoFocus
            style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:`1px solid ${erro?'rgba(248,113,113,0.5)':'rgba(255,255,255,0.1)'}`, borderRadius:'12px', padding:'14px 48px 14px 16px', color:'#e2e8f0', fontSize:'16px', letterSpacing:mostrar?'normal':'0.2em', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' }}
          />
          <button onClick={()=>setMostrar(!mostrar)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(226,232,240,0.35)', fontSize:'16px', padding:'4px' }}>
            {mostrar?'🙈':'👁️'}
          </button>
        </div>
        {erro && <p style={{ fontSize:'12px', color:'#f87171', marginBottom:'12px', textAlign:'center' }}>Senha incorreta. Tente novamente.</p>}
        <button
          onClick={tentar}
          disabled={loading||!senha}
          style={{ width:'100%', background:senha&&!loading?'linear-gradient(135deg,#6ee7b7,#3b82f6)':'rgba(255,255,255,0.06)', border:'none', borderRadius:'12px', padding:'14px', color:senha&&!loading?'#070b16':'rgba(226,232,240,0.3)', fontSize:'15px', fontWeight:700, cursor:senha?'pointer':'not-allowed', transition:'all 0.2s', boxShadow:senha&&!loading?'0 4px 20px rgba(110,231,183,0.3)':'none' }}
        >
          {loading?'...':'Entrar'}
        </button>
      </div>
      <p style={{ marginTop:'32px', fontSize:'11px', color:'rgba(226,232,240,0.2)', animation:'fadeIn 1s ease 0.5s both' }}>NestFi · Independência Familiar</p>
    </div>
  )
}
