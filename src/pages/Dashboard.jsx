import { useNavigate } from 'react-router-dom'
import useFinancasStore from '../store'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0)
const fmtK = (v) => { if (Math.abs(v) >= 1e6) return `R$${(v/1e6).toFixed(1)}M`; if (Math.abs(v) >= 1e3) return `R$${(v/1e3).toFixed(0)}k`; return fmt(v) }

// Cálculos automáticos de IR e Petros
function calcSalario(salario) {
  const brutos = ['salarioBasico','rmnr','anuenio','gratFuncaoGer','heDesembarque','auxilioEducacional']
  const totalBruto = brutos.reduce((a,k) => a+(salario[k]||0), 0)
  const petros = totalBruto * 0.09
  const ir = Math.max(0, (totalBruto - (salario.inss||0) - petros) * 0.275 - 908.73)
  const totalDesc = (salario.inss||0) + (salario.ams||0) + petros + ir
  return { totalBruto, petros, ir, totalDesc, liquido: totalBruto - totalDesc }
}

const LOGO = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwZDE1MjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA3MGIxNjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Im5lc3RHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZlZTdiNztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2I4MmY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iY2hhcnRHcmFkIiB4MT0iMCUiIHkxPSIxMDAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzgxOGNmODtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmVlN2I3O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYXJlYUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZlZTdiNztzdG9wLW9wYWNpdHk6MC4xOCIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmVlN2I3O3N0b3Atb3BhY2l0eTowIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxmaWx0ZXIgaWQ9Imdsb3ciPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyLjUiIHJlc3VsdD0iY29sb3JlZEJsdXIiLz4KICAgICAgPGZlTWVyZ2U+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJjb2xvcmVkQmx1ciIvPgogICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgICA8L2ZlTWVyZ2U+CiAgICA8L2ZpbHRlcj4KICAgIDxmaWx0ZXIgaWQ9InNvZnRHbG93Ij4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNyIgcmVzdWx0PSJjb2xvcmVkQmx1ciIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImNvbG9yZWRCbHVyIi8+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJTb3VyY2VHcmFwaGljIi8+CiAgICAgIDwvZmVNZXJnZT4KICAgIDwvZmlsdGVyPgogICAgPGNsaXBQYXRoIGlkPSJuZXN0Q2xpcCI+CiAgICAgIDxlbGxpcHNlIGN4PSIyMDAiIGN5PSIyMTgiIHJ4PSI4OCIgcnk9IjQyIi8+CiAgICA8L2NsaXBQYXRoPgogIDwvZGVmcz4KCiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxODAiIGZpbGw9InVybCgjYmdHcmFkKSIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMTgwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTEwLDIzMSwxODMsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KCiAgPGVsbGlwc2UgY3g9IjIwMCIgY3k9IjIzMCIgcng9IjExMCIgcnk9IjM1IiBmaWxsPSJyZ2JhKDExMCwyMzEsMTgzLDAuMDUpIiBmaWx0ZXI9InVybCgjc29mdEdsb3cpIi8+CgogIDxnIGNsaXAtcGF0aD0idXJsKCNuZXN0Q2xpcCkiPgogICAgPHBhdGggZD0iTSAxMzAgMjQ1IEwgMTQ4IDIzMiBMIDE2NiAyMzggTCAxODQgMjIyIEwgMjAyIDIxMCBMIDIyMiAyMDAgTCAyNDAgMTkwIEwgMjQwIDI1NSBMIDEzMCAyNTUgWiIKICAgICAgZmlsbD0idXJsKCNhcmVhR3JhZCkiLz4KICAgIDxwb2x5bGluZQogICAgICBwb2ludHM9IjEzMCwyNDUgMTQ4LDIzMiAxNjYsMjM4IDE4NCwyMjIgMjAyLDIxMCAyMjIsMjAwIDI0MCwxOTAiCiAgICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNjaGFydEdyYWQpIiBzdHJva2Utd2lkdGg9IjIuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWx0ZXI9InVybCgjZ2xvdykiLz4KICAgIDxjaXJjbGUgY3g9IjEzMCIgY3k9IjI0NSIgcj0iMyIgZmlsbD0iIzgxOGNmOCIvPgogICAgPGNpcmNsZSBjeD0iMTQ4IiBjeT0iMjMyIiByPSIzIiBmaWxsPSIjODE4Y2Y4Ii8+CiAgICA8Y2lyY2xlIGN4PSIxNjYiIGN5PSIyMzgiIHI9IjMiIGZpbGw9IiM4MThjZjgiLz4KICAgIDxjaXJjbGUgY3g9IjE4NCIgY3k9IjIyMiIgcj0iMyIgZmlsbD0iIzZlZTdiNyIvPgogICAgPGNpcmNsZSBjeD0iMjAyIiBjeT0iMjEwIiByPSIzIiBmaWxsPSIjNmVlN2I3Ii8+CiAgICA8Y2lyY2xlIGN4PSIyMjIiIGN5PSIyMDAiIHI9IjMiIGZpbGw9IiM2ZWU3YjciLz4KICAgIDxjaXJjbGUgY3g9IjI0MCIgY3k9IjE5MCIgcj0iNSIgZmlsbD0iIzZlZTdiNyIgZmlsdGVyPSJ1cmwoI3NvZnRHbG93KSIvPgogICAgPGNpcmNsZSBjeD0iMjQwIiBjeT0iMTkwIiByPSIyLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjk1Ii8+CiAgPC9nPgoKICA8cGF0aCBkPSJNIDk1IDI1MiBRIDIwMCAzMTggMzA1IDI1MiIKICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNy41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbHRlcj0idXJsKCNnbG93KSIgb3BhY2l0eT0iMC45NSIvPgogIDxwYXRoIGQ9Ik0gMTE0IDIzMiBRIDIwMCAyOTIgMjg2IDIzMiIKICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWx0ZXI9InVybCgjZ2xvdykiIG9wYWNpdHk9IjAuNzUiLz4KICA8cGF0aCBkPSJNIDEzNSAyMTUgUSAyMDAgMjY4IDI2NSAyMTUiCiAgICBmaWxsPSJub25lIiBzdHJva2U9InVybCgjbmVzdEdyYWQpIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsdGVyPSJ1cmwoI2dsb3cpIiBvcGFjaXR5PSIwLjUiLz4KICA8cGF0aCBkPSJNIDk1IDI1MiBRIDg3IDIzNCAxMTQgMjMyIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjbmVzdEdyYWQpIiBzdHJva2Utd2lkdGg9IjUuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjgiLz4KICA8cGF0aCBkPSJNIDMwNSAyNTIgUSAzMTMgMjM0IDI4NiAyMzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNuZXN0R3JhZCkiIHN0cm9rZS13aWR0aD0iNS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjAuOCIvPgoKICA8dGV4dCB4PSIyMDAiIHk9IjMxOCIKICAgIGZvbnQtZmFtaWx5PSInU29yYScsICdJbnRlcicsIHNhbnMtc2VyaWYiCiAgICBmb250LXNpemU9IjQ0IgogICAgZm9udC13ZWlnaHQ9IjgwMCIKICAgIHRleHQtYW5jaG9yPSJtaWRkbGUiCiAgICBsZXR0ZXItc3BhY2luZz0iLTEiCiAgICBmaWxsPSJ3aGl0ZSI+CiAgICBOZXN0PHRzcGFuIGZpbGw9InVybCgjbmVzdEdyYWQpIj5GaTwvdHNwYW4+CiAgPC90ZXh0PgoKICA8dGV4dCB4PSIyMDAiIHk9IjM0NCIKICAgIGZvbnQtZmFtaWx5PSInU29yYScsICdJbnRlcicsIHNhbnMtc2VyaWYiCiAgICBmb250LXNpemU9IjEyIgogICAgZm9udC13ZWlnaHQ9IjQwMCIKICAgIHRleHQtYW5jaG9yPSJtaWRkbGUiCiAgICBsZXR0ZXItc3BhY2luZz0iMy41IgogICAgZmlsbD0icmdiYSgyMjYsMjMyLDI0MCwwLjMpIj4KICAgIElOREVQRU5Ew4pOQ0lBIEZBTUlMSUFSCiAgPC90ZXh0PgoKPC9zdmc+Cg==`

export default function Dashboard() {
  const navigate = useNavigate()
  const { salario, outrasRendas, categoriasDespesas, investimentos, financiamentos } = useFinancasStore()

  const { liquido: salLiq, totalBruto } = calcSalario(salario)

  const outrasLiq = outrasRendas.reduce((a, r) => {
    if (r.tipo === 'salario') {
      const { liquido } = calcSalario(r.salario || {})
      return a + liquido
    }
    const desp = (r.despesas||[]).reduce((b,d)=>b+d.valor,0)
    return a + r.valor - desp
  }, 0)

  const rendaTotal    = salLiq + outrasLiq
  const totalDespesas = categoriasDespesas.reduce((a,c)=>a+c.itens.reduce((b,i)=>b+i.valor,0),0)
  const saldo         = rendaTotal - totalDespesas
  const totalInvest   = investimentos.reduce((a,i)=>a+i.valor,0)
  const totalDividas  = financiamentos.reduce((a,f)=>a+f.saldoDevedor,0)
  const patrimLiq     = totalInvest - totalDividas
  const taxaPoupanca  = rendaTotal > 0 ? (saldo/rendaTotal)*100 : 0

  const topDespesas = categoriasDespesas
    .map(c=>({ nome:c.nome, valor:c.itens.reduce((a,i)=>a+i.valor,0), cor:c.cor, icone:c.icone }))
    .sort((a,b)=>b.valor-a.valor)

  return (
    <div style={{ minHeight:'100vh', background:'#070b16' }}>

      {/* HERO com logo */}
      <div style={{
        background: 'linear-gradient(160deg, #0d1a2e 0%, #070b16 70%)',
        padding: '52px 20px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'280px', height:'280px', background:'radial-gradient(circle,rgba(110,231,183,0.07) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

        {/* Logo + saldo hero */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', animation:'fadeUp 0.5s ease both' }}>
          <img src={LOGO} alt="NestFi" style={{ width:'56px', height:'56px', borderRadius:'16px' }} />
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.35)', letterSpacing:'0.1em', textTransform:'uppercase' }}>saldo do mês</p>
            <p style={{
              fontSize:'32px', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1,
              fontFamily:"'JetBrains Mono',monospace",
              color: saldo >= 0 ? '#6ee7b7' : '#f87171',
              marginTop:'4px',
            }}>{fmt(saldo)}</p>
          </div>
        </div>

        {/* Renda × Despesas */}
        <div style={{
          background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'18px', padding:'16px',
          display:'grid', gridTemplateColumns:'1fr 1px 1fr 1px 1fr', gap:'0',
          animation:'fadeUp 0.5s ease 0.1s both',
        }}>
          {[
            { label:'Renda Total', value:rendaTotal, color:'#6ee7b7' },
            { label:'Despesas', value:totalDespesas, color:'#f87171' },
            { label:'Taxa Poupança', value:`${taxaPoupanca.toFixed(1)}%`, color:'#818cf8', isText:true },
          ].map((s,i) => (
            <>
              <div key={s.label} style={{ textAlign:'center', padding:'4px 8px' }}>
                <p style={{ fontSize:'15px', fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>
                  {s.isText ? s.value : fmtK(s.value)}
                </p>
                <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.35)', marginTop:'3px' }}>{s.label}</p>
              </div>
              {i < 2 && <div key={`div${i}`} style={{ background:'rgba(255,255,255,0.06)', width:'1px' }} />}
            </>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* Cards navegáveis */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px', animation:'fadeUp 0.5s ease 0.15s both' }}>
          {[
            { label:'Salário Líquido', value:salLiq, color:'#6ee7b7', icon:'💼', path:'/proventos', sub:`Bruto ${fmtK(totalBruto)}` },
            { label:'Outras Rendas', value:outrasLiq, color:'#fbbf24', icon:'💵', path:'/proventos', sub:`${outrasRendas.length} fontes` },
            { label:'Total Investido', value:totalInvest, color:'#818cf8', icon:'📊', path:'/investimentos', sub:`${investimentos.length} ativos` },
            { label:'Patrimônio Líq.', value:patrimLiq, color:'#a78bfa', icon:'🏆', path:'/simulador', sub:'Invest. − Dívidas' },
          ].map((card,i) => (
            <button key={card.label} onClick={()=>navigate(card.path)}
              className="card-hover btn-press"
              style={{
                background:'linear-gradient(135deg,#111827,#0d1220)',
                border:`1px solid ${card.color}18`, borderRadius:'18px',
                padding:'16px', textAlign:'left', cursor:'pointer',
                position:'relative', overflow:'hidden',
                animation:`fadeUp 0.5s ease ${0.2+i*0.04}s both`,
                boxShadow:'0 2px 12px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ position:'absolute', bottom:'-20px', right:'-20px', width:'80px', height:'80px', background:`radial-gradient(circle,${card.color}12 0%,transparent 70%)`, borderRadius:'50%' }} />
              <p style={{ fontSize:'20px', marginBottom:'10px' }}>{card.icon}</p>
              <p style={{ fontSize:'16px', fontWeight:800, color:card.color, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em', marginBottom:'3px' }}>
                {fmtK(card.value)}
              </p>
              <p style={{ fontSize:'11px', fontWeight:600, color:'rgba(226,232,240,0.65)' }}>{card.label}</p>
              <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)', marginTop:'2px' }}>{card.sub}</p>
            </button>
          ))}
        </div>

        {/* Despesas por categoria */}
        <div style={{
          background:'#111827', border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'20px', padding:'18px', marginBottom:'16px',
          animation:'fadeUp 0.5s ease 0.35s both',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(226,232,240,0.7)' }}>Despesas do mês</p>
            <button onClick={()=>navigate('/despesas')} style={{ background:'none', border:'none', fontSize:'11px', color:'#818cf8', cursor:'pointer' }}>Ver detalhes →</button>
          </div>

          {/* Barra total */}
          <div style={{ display:'flex', height:'6px', borderRadius:'3px', overflow:'hidden', gap:'1px', marginBottom:'14px' }}>
            {topDespesas.map(c => (
              <div key={c.nome} style={{ width:`${totalDespesas>0?(c.valor/totalDespesas)*100:0}%`, background:c.cor, transition:'width 0.8s ease' }} />
            ))}
          </div>

          {topDespesas.map((cat,i) => {
            const pct = totalDespesas>0?(cat.valor/totalDespesas)*100:0
            return (
              <div key={cat.nome} style={{ marginBottom: i<topDespesas.length-1?'10px':0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontSize:'12px', color:'rgba(226,232,240,0.6)', display:'flex', alignItems:'center', gap:'6px' }}>
                    <span>{cat.icone}</span>{cat.nome}
                  </span>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ fontSize:'12px', fontWeight:700, color:cat.cor, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(cat.valor)}</span>
                    <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)', marginLeft:'6px' }}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <div style={{ height:'3px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:cat.cor, borderRadius:'2px' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Atalhos rápidos */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', animation:'fadeUp 0.5s ease 0.4s both' }}>
          {[
            { label:'Assinaturas', icon:'📋', path:'/assinaturas', color:'#fb923c' },
            { label:'Simulador', icon:'🔮', path:'/simulador', color:'#8b5cf6' },
            { label:'Financ.', icon:'🏦', path:'/financiamentos', color:'#f87171' },
          ].map(l => (
            <button key={l.path} onClick={()=>navigate(l.path)} className="btn-press"
              style={{
                background:`${l.color}0d`, border:`1px solid ${l.color}22`,
                borderRadius:'14px', padding:'14px 8px',
                display:'flex', flexDirection:'column', alignItems:'center', gap:'6px',
                cursor:'pointer',
              }}
            >
              <span style={{ fontSize:'22px' }}>{l.icon}</span>
              <span style={{ fontSize:'11px', fontWeight:600, color:l.color }}>{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
