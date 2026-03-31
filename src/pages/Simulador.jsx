import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid } from 'recharts'
import useFinancasStore from '../store'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(v||0)
const fmtM = (v) => { if (Math.abs(v)>=1e9) return `R$${(v/1e9).toFixed(2)}B`; if (Math.abs(v)>=1e6) return `R$${(v/1e6).toFixed(2)}M`; if (Math.abs(v)>=1e3) return `R$${(v/1e3).toFixed(0)}k`; return fmt(v) }

function projetar({ patrimonioAtual, taxaJurosAnual, aporteMensal, horizonte, inflacaoAnual }) {
  const taxaMensal   = (1+taxaJurosAnual/100)**(1/12)-1
  const inflacaoMens = (1+inflacaoAnual/100)**(1/12)-1
  const taxaReal     = taxaMensal - inflacaoMens
  let saldo=patrimonioAtual, saldoReal=patrimonioAtual, totalAporte=0
  const dadosAnuais=[], dadosMensais=[]
  for (let mes=1; mes<=horizonte*12; mes++) {
    saldo     = saldo*(1+taxaMensal)+aporteMensal
    saldoReal = saldoReal*(1+taxaReal)+aporteMensal
    totalAporte += aporteMensal
    dadosMensais.push({ mes, saldo, saldoReal, totalAporte })
    if (mes%12===0) {
      const ano=mes/12
      dadosAnuais.push({ ano, labelShort:`${ano}a`, saldo, saldoReal, totalAporte, juros:saldo-totalAporte-patrimonioAtual })
    }
  }
  return { dadosAnuais, dadosMensais }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background:'rgba(7,11,22,0.97)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'12px', padding:'12px 16px' }}>
      <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.5)', marginBottom:'6px' }}>{label}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', gap:'20px' }}>
          <span style={{ fontSize:'11px', color:'#6ee7b7' }}>Nominal</span>
          <span style={{ fontSize:'13px', fontWeight:800, color:'#6ee7b7', fontFamily:"'JetBrains Mono',monospace" }}>{fmtM(d?.saldo)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', gap:'20px' }}>
          <span style={{ fontSize:'11px', color:'#818cf8' }}>Real</span>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#818cf8', fontFamily:"'JetBrains Mono',monospace" }}>{fmtM(d?.saldoReal)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', gap:'20px' }}>
          <span style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)' }}>Aportado</span>
          <span style={{ fontSize:'11px', color:'rgba(226,232,240,0.6)', fontFamily:"'JetBrains Mono',monospace" }}>{fmtM(d?.totalAporte)}</span>
        </div>
      </div>
    </div>
  )
}

function InputParam({ label, value, onChange, prefix, suffix, type='number' }) {
  const [local, setLocal] = useState(String(value))
  const [focused, setFocused] = useState(false)

  const confirm = () => {
    const v = parseFloat(local.replace(/\./g,'').replace(',','.'))
    if (!isNaN(v)) onChange(v)
    setFocused(false)
  }

  return (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'6px', letterSpacing:'0.05em' }}>{label}</label>
      <div style={{
        display:'flex', alignItems:'center',
        background:'rgba(255,255,255,0.05)',
        border:`1px solid ${focused?'rgba(110,231,183,0.4)':'rgba(255,255,255,0.1)'}`,
        borderRadius:'10px', overflow:'hidden',
        transition:'border-color 0.2s',
      }}>
        {prefix && <span style={{ padding:'10px 10px 10px 14px', fontSize:'13px', color:'rgba(226,232,240,0.4)', background:'rgba(255,255,255,0.03)', borderRight:'1px solid rgba(255,255,255,0.07)' }}>{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={focused ? local : (suffix ? value : value.toLocaleString('pt-BR'))}
          onChange={e=>setLocal(e.target.value)}
          onFocus={()=>{ setLocal(String(value)); setFocused(true) }}
          onBlur={confirm}
          onKeyDown={e=>{ if(e.key==='Enter') confirm() }}
          style={{
            flex:1, background:'none', border:'none', padding:'10px 12px',
            color:'#e2e8f0', fontSize:'14px', fontWeight:700,
            fontFamily:"'JetBrains Mono',monospace",
          }}
        />
        {suffix && <span style={{ padding:'10px 14px 10px 4px', fontSize:'13px', color:'rgba(226,232,240,0.4)' }}>{suffix}</span>}
      </div>
    </div>
  )
}

function MarcoEditavel({ marco, onUpdate, anoAtingido, dadosMensais }) {
  const [editingValor, setEditingValor] = useState(false)
  const [editingEmoji, setEditingEmoji] = useState(false)
  const [localValor, setLocalValor] = useState(String(marco.valor))
  const [localEmoji, setLocalEmoji] = useState(marco.emoji)

  const atingido = anoAtingido !== null
  const hit = dadosMensais.find(d=>d.saldo>=marco.valor)
  const anoStr = hit ? (hit.mes/12).toFixed(1) : null

  const saveValor = () => {
    const v = parseFloat(localValor.replace(/\./g,'').replace(',','.'))
    if (!isNaN(v) && v>0) onUpdate(marco.id, { valor:v, label:fmtM(v) })
    setEditingValor(false)
  }
  const saveEmoji = () => { onUpdate(marco.id, { emoji:localEmoji }); setEditingEmoji(false) }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', opacity:atingido?1:0.45 }}>
      {editingEmoji ? (
        <input value={localEmoji} onChange={e=>setLocalEmoji(e.target.value)} onBlur={saveEmoji} onKeyDown={e=>e.key==='Enter'&&saveEmoji()} autoFocus
          style={{ width:'40px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'4px', fontSize:'18px', textAlign:'center', color:'#e2e8f0' }} />
      ) : (
        <button onClick={()=>setEditingEmoji(true)} style={{ fontSize:'22px', background:'none', border:'none', cursor:'pointer', padding:'0', flexShrink:0, lineHeight:1 }}>{marco.emoji}</button>
      )}
      <div style={{ flex:1 }}>
        {editingValor ? (
          <input value={localValor} onChange={e=>setLocalValor(e.target.value)} onBlur={saveValor} onKeyDown={e=>e.key==='Enter'&&saveValor()} autoFocus
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(110,231,183,0.3)', borderRadius:'8px', padding:'4px 8px', color:'#e2e8f0', fontSize:'13px', fontFamily:"'JetBrains Mono',monospace", width:'120px' }} />
        ) : (
          <button onClick={()=>{ setLocalValor(String(marco.valor)); setEditingValor(true) }}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:700, color:atingido?'#e2e8f0':'rgba(226,232,240,0.5)', fontFamily:"'JetBrains Mono',monospace", padding:0, textAlign:'left' }}>
            {fmtM(marco.valor)}
          </button>
        )}
        <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)', marginTop:'2px' }}>toque para editar</p>
      </div>
      {atingido
        ? <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:'12px', fontWeight:700, color:'#6ee7b7' }}>Ano {anoStr}</p>
            <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>{new Date().getFullYear()+Math.ceil(parseFloat(anoStr))}</p>
          </div>
        : <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.25)' }}>Não atingido</p>
      }
    </div>
  )
}

export default function Simulador() {
  const { simulador, updateSimulador, marcos, updateMarco, investimentos } = useFinancasStore()
  const [showTabela, setShowTabela] = useState(false)

  const totalInvestido = investimentos.reduce((a,i)=>a+i.valor,0)
  const { patrimonioAtual, taxaJurosAnual, aporteMensal, horizonte, inflacaoAnual, metaPatrimonio } = simulador

  const { dadosAnuais, dadosMensais } = useMemo(
    ()=>projetar({ patrimonioAtual, taxaJurosAnual, aporteMensal, horizonte, inflacaoAnual }),
    [patrimonioAtual, taxaJurosAnual, aporteMensal, horizonte, inflacaoAnual]
  )

  const final      = dadosAnuais[dadosAnuais.length-1] || {}
  const finalNom   = final.saldo || 0
  const finalReal  = final.saldoReal || 0
  const totalAporte= final.totalAporte || 0
  const totalJuros = finalNom - totalAporte - patrimonioAtual
  const rentMensal = finalNom * (taxaJurosAnual/100/12)
  const metaNoGraf = metaPatrimonio <= Math.max(...dadosAnuais.map(d=>d.saldo||0))*1.05
  const anoMeta    = dadosMensais.find(d=>d.saldo>=metaPatrimonio)
  const anosMeta   = anoMeta ? (anoMeta.mes/12).toFixed(1) : null

  return (
    <div style={{ padding:'0 0 8px' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0d1526,#070b16)', padding:'48px 20px 20px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'220px', height:'220px', background:'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)', borderRadius:'50%' }} />
        <h1 style={{ fontSize:'26px', fontWeight:800, letterSpacing:'-0.02em', animation:'fadeUp 0.5s ease both' }}>Simulador</h1>
        <p style={{ fontSize:'13px', color:'rgba(226,232,240,0.4)', marginTop:'4px', animation:'fadeUp 0.5s ease 0.05s both' }}>Projeção de {horizonte} anos com juros compostos</p>

        {/* 2 KPIs principais */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'16px', animation:'fadeUp 0.5s ease 0.1s both' }}>
          <div style={{ background:'linear-gradient(135deg,rgba(110,231,183,0.12),rgba(110,231,183,0.04))', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'16px', padding:'14px' }}>
            <p style={{ fontSize:'11px', color:'rgba(110,231,183,0.7)', marginBottom:'4px' }}>Nominal em {horizonte} anos</p>
            <p style={{ fontSize:'22px', fontWeight:800, color:'#6ee7b7', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em' }}>{fmtM(finalNom)}</p>
            <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.4)', marginTop:'3px' }}>Renda/mês: {fmtM(rentMensal)}</p>
          </div>
          <div style={{ background:'linear-gradient(135deg,rgba(129,140,248,0.12),rgba(129,140,248,0.04))', border:'1px solid rgba(129,140,248,0.2)', borderRadius:'16px', padding:'14px' }}>
            <p style={{ fontSize:'11px', color:'rgba(129,140,248,0.7)', marginBottom:'4px' }}>Valor Real (hoje)</p>
            <p style={{ fontSize:'22px', fontWeight:800, color:'#818cf8', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em' }}>{fmtM(finalReal)}</p>
            <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.4)', marginTop:'3px' }}>Juros gerados: {fmtM(totalJuros)}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Meta */}
        {anosMeta ? (
          <div style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.22)', borderRadius:'16px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px', animation:'fadeUp 0.5s ease 0.15s both' }}>
            <span style={{ fontSize:'24px' }}>🎯</span>
            <div>
              <p style={{ fontSize:'13px', fontWeight:700, color:'#fbbf24' }}>Meta {fmtM(metaPatrimonio)} atingida em <strong>{anosMeta} anos</strong></p>
              <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', marginTop:'2px' }}>Ano {new Date().getFullYear()+Math.ceil(parseFloat(anosMeta))}</p>
            </div>
          </div>
        ) : (
          <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.18)', borderRadius:'16px', padding:'12px 16px', marginBottom:'16px', animation:'fadeUp 0.5s ease 0.15s both' }}>
            <p style={{ fontSize:'13px', color:'#f87171' }}>🎯 Meta {fmtM(metaPatrimonio)} não atingida no período</p>
          </div>
        )}

        {/* Gráfico */}
        <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'18px', marginBottom:'16px', animation:'fadeUp 0.5s ease 0.2s both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(226,232,240,0.7)' }}>Evolução Patrimonial</p>
            <div style={{ display:'flex', gap:'10px' }}>
              {[{l:'Nominal',c:'#6ee7b7'},{l:'Real',c:'#818cf8'}].map(x=>(
                <div key={x.l} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ width:'8px',height:'2px',background:x.c,display:'inline-block',borderRadius:'1px' }} />
                  <span style={{ fontSize:'10px',color:'rgba(226,232,240,0.4)' }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={dadosAnuais} margin={{ top:8,right:4,bottom:0,left:0 }}>
              <defs>
                <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.18}/>
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false}/>
              <XAxis dataKey="labelShort" stroke="transparent" tick={{ fill:'rgba(226,232,240,0.3)', fontSize:9 }} axisLine={false} tickLine={false} interval={horizonte>20?4:1}/>
              <YAxis hide/>
              <Tooltip content={<CustomTooltip />}/>
              {metaNoGraf && <ReferenceLine y={metaPatrimonio} stroke="#fbbf24" strokeDasharray="4 4" strokeWidth={1} label={{ value:`Meta`, fill:'#fbbf24', fontSize:9, position:'insideTopRight' }}/>}
              <Area type="monotone" dataKey="saldoReal" stroke="#818cf8" strokeWidth={1.5} fill="url(#gR)" dot={false}/>
              <Area type="monotone" dataKey="saldo" stroke="#6ee7b7" strokeWidth={2} fill="url(#gN)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Parâmetros por input */}
        <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'18px', marginBottom:'16px', animation:'fadeUp 0.5s ease 0.25s both' }}>
          <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(226,232,240,0.7)', marginBottom:'16px' }}>⚙️ Parâmetros</p>

          <InputParam label="Patrimônio Atual" value={patrimonioAtual} prefix="R$" onChange={v=>updateSimulador({patrimonioAtual:v})} />
          <InputParam label="Aporte Mensal" value={aporteMensal} prefix="R$" onChange={v=>updateSimulador({aporteMensal:v})} />
          <InputParam label="Taxa de Juros Anual" value={taxaJurosAnual} suffix="% a.a." onChange={v=>updateSimulador({taxaJurosAnual:v})} />
          <InputParam label="Inflação Anual" value={inflacaoAnual} suffix="% a.a." onChange={v=>updateSimulador({inflacaoAnual:v})} />
          <InputParam label="Horizonte de Tempo" value={horizonte} suffix="anos" onChange={v=>updateSimulador({horizonte:Math.max(1,Math.min(60,v))})} />
          <InputParam label="Meta Patrimonial" value={metaPatrimonio} prefix="R$" onChange={v=>updateSimulador({metaPatrimonio:v})} />

          {totalInvestido > 0 && (
            <div style={{ marginTop:'4px', background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.15)', borderRadius:'10px', padding:'10px 12px' }}>
              <p style={{ fontSize:'11px', color:'#6ee7b7', marginBottom:'6px' }}>💡 Seus investimentos totalizam {fmtM(totalInvestido)}</p>
              <button onClick={()=>updateSimulador({patrimonioAtual:Math.round(totalInvestido)})}
                style={{ background:'rgba(110,231,183,0.12)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'7px', padding:'5px 10px', color:'#6ee7b7', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>
                Usar como patrimônio inicial
              </button>
            </div>
          )}
        </div>

        {/* 3 Marcos editáveis */}
        <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'18px', marginBottom:'16px', animation:'fadeUp 0.5s ease 0.3s both' }}>
          <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(226,232,240,0.7)', marginBottom:'4px' }}>🏆 Marcos Patrimoniais</p>
          <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.3)', marginBottom:'12px' }}>Toque no valor ou emoji para editar</p>
          {marcos.map(m => {
            const hit = dadosMensais.find(d=>d.saldo>=m.valor)
            return (
              <MarcoEditavel key={m.id} marco={m} onUpdate={updateMarco} anoAtingido={hit?(hit.mes/12).toFixed(1):null} dadosMensais={dadosMensais} />
            )
          })}
        </div>

        {/* Tabela */}
        <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'18px', marginBottom:'16px', animation:'fadeUp 0.5s ease 0.35s both' }}>
          <button onClick={()=>setShowTabela(!showTabela)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(226,232,240,0.7)' }}>📋 Tabela Anual</p>
            <span style={{ fontSize:'12px', color:'rgba(226,232,240,0.4)' }}>{showTabela?'▲':'▼'}</span>
          </button>
          {showTabela && (
            <div style={{ marginTop:'14px', overflowX:'auto', animation:'scaleIn 0.2s ease both' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px', minWidth:'320px' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    {['Ano','Nominal','Real','Juros acum.'].map(h=>(
                      <th key={h} style={{ padding:'6px 4px', textAlign:'right', color:'rgba(226,232,240,0.4)', fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dadosAnuais.map((row,i)=>{
                    const dest=row.ano%5===0
                    return (
                      <tr key={row.ano} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', background:dest?'rgba(110,231,183,0.04)':i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding:'5px 4px', textAlign:'right', color:dest?'#6ee7b7':'rgba(226,232,240,0.5)', fontWeight:dest?700:400 }}>{row.ano}</td>
                        <td style={{ padding:'5px 4px', textAlign:'right', color:'#6ee7b7', fontFamily:"'JetBrains Mono',monospace", fontWeight:dest?800:600 }}>{fmtM(row.saldo)}</td>
                        <td style={{ padding:'5px 4px', textAlign:'right', color:'#818cf8', fontFamily:"'JetBrains Mono',monospace" }}>{fmtM(row.saldoReal)}</td>
                        <td style={{ padding:'5px 4px', textAlign:'right', color:'#fbbf24', fontFamily:"'JetBrains Mono',monospace" }}>{fmtM(row.juros)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.2)', textAlign:'center', lineHeight:1.6, animation:'fadeIn 1s ease 0.5s both' }}>
          Simulação educativa. Rendimentos passados não garantem resultados futuros.
        </p>
      </div>
    </div>
  )
}
