import { useState, useMemo } from 'react'
import useFinancasStore from '../store'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0)
const fmtD = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtP = (v) => `${(v||0).toFixed(4)}%`

const TIPOS = {
  imovel:   { label:'Imóvel',          emoji:'🏠', color:'#6ee7b7' },
  veiculo:  { label:'Veículo',         emoji:'🚗', color:'#60a5fa' },
  pessoal:  { label:'Crédito Pessoal', emoji:'💳', color:'#a78bfa' },
  consorcio:{ label:'Consórcio',       emoji:'🤝', color:'#fbbf24' },
  outro:    { label:'Outro',           emoji:'📋', color:'#fb923c' },
}

function gerarTabela(fin, quantidadeMeses) {
  const taxa = fin.taxaJuros / 100 / 12
  const n    = fin.prazoMeses
  const pv   = fin.saldoDevedor
  const meses = Math.min(quantidadeMeses, n)

  if (taxa === 0) {
    const amort = pv / n
    let saldo = pv
    return Array.from({ length: meses }, (_, i) => {
      const row = { mes: i+1, prestacao: amort, amortizacao: amort, juros: 0, saldo: saldo - amort }
      saldo -= amort
      return row
    })
  }

  if (fin.amortizacao === 'PRICE') {
    const pmt = (pv * taxa * Math.pow(1+taxa, n)) / (Math.pow(1+taxa, n) - 1)
    let saldo = pv
    return Array.from({ length: meses }, (_, i) => {
      const juros = saldo * taxa
      const amort = pmt - juros
      saldo = Math.max(0, saldo - amort)
      return { mes: i+1, prestacao: pmt, amortizacao: amort, juros, saldo }
    })
  } else {
    // SAC
    const amortFixa = pv / n
    let saldo = pv
    return Array.from({ length: meses }, (_, i) => {
      const juros     = saldo * taxa
      const prestacao = amortFixa + juros
      saldo = Math.max(0, saldo - amortFixa)
      return { mes: i+1, prestacao, amortizacao: amortFixa, juros, saldo }
    })
  }
}

function ProgressoFinanciamento({ fin }) {
  const pago = fin.valorOriginal - fin.saldoDevedor
  const pct  = fin.valorOriginal > 0 ? (pago / fin.valorOriginal) * 100 : 0
  const t    = TIPOS[fin.tipo] || TIPOS.outro
  return (
    <div style={{ marginBottom:'12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
        <span style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)' }}>Progresso do pagamento</span>
        <span style={{ fontSize:'11px', color:t.color, fontWeight:700 }}>{pct.toFixed(1)}% pago</span>
      </div>
      <div style={{ height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg,${t.color},${t.color}aa)`, borderRadius:'3px', transition:'width 1s ease', boxShadow:`0 0 8px ${t.color}50` }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
        <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>Pago: {fmtD(pago)}</span>
        <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>Original: {fmtD(fin.valorOriginal)}</span>
      </div>
    </div>
  )
}

function FinCard({ fin, onUpdate, onRemove }) {
  const [open, setOpen]   = useState(false)
  const [editing, setEditing] = useState(false)
  const [tabView, setTabView] = useState('resumo') // 'resumo' | 'tabela' | 'custos'
  const [tabelaMeses, setTabelaMeses] = useState(12)
  const [local, setLocal] = useState({ ...fin })
  const [novoCusto, setNovoCusto] = useState({ nome:'', valor:'' })
  const [addingCusto, setAddingCusto] = useState(false)

  const t = TIPOS[fin.tipo] || TIPOS.outro
  const taxaMensal = fin.taxaJuros / 100 / 12
  const custosTotais = (fin.custos||[]).reduce((a,c)=>a+c.valor,0)

  const tabela = useMemo(() => gerarTabela(fin, tabelaMeses), [fin, tabelaMeses])
  const primeiraP = tabela[0] || {}
  const totalJuros12 = tabela.slice(0,12).reduce((a,r)=>a+r.juros,0)
  const totalPago12  = tabela.slice(0,12).reduce((a,r)=>a+r.prestacao,0)

  const save = () => {
    onUpdate(fin.id, {
      ...local,
      saldoDevedor: parseFloat(local.saldoDevedor)||0,
      valorOriginal: parseFloat(local.valorOriginal)||0,
      taxaJuros: parseFloat(local.taxaJuros)||0,
      prazoMeses: parseInt(local.prazoMeses)||0,
      parcelaMensal: parseFloat(local.parcelaMensal)||0,
    })
    setEditing(false)
  }

  const addCusto = () => {
    if (!novoCusto.nome || !novoCusto.valor) return
    const custos = [...(fin.custos||[]), { nome: novoCusto.nome, valor: parseFloat(novoCusto.valor) }]
    onUpdate(fin.id, { custos })
    setNovoCusto({ nome:'', valor:'' })
    setAddingCusto(false)
  }
  const removeCusto = (idx) => {
    const custos = (fin.custos||[]).filter((_,i)=>i!==idx)
    onUpdate(fin.id, { custos })
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #111827, #0d1422)',
      border: `1px solid ${t.color}20`, borderRadius:'20px',
      overflow:'hidden', marginBottom:'12px',
      boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
    }}>
      {/* Header */}
      <button onClick={()=>setOpen(!open)} style={{
        width:'100%', background:'none', border:'none', cursor:'pointer',
        padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', textAlign:'left' }}>
          <span style={{
            width:'46px', height:'46px', background:`${t.color}18`, border:`1px solid ${t.color}28`,
            borderRadius:'13px', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'22px', flexShrink:0, boxShadow:`0 4px 12px ${t.color}22`,
          }}>{t.emoji}</span>
          <div>
            <p style={{ fontSize:'15px', fontWeight:700, color:'#e2e8f0' }}>{fin.nome}</p>
            <div style={{ display:'flex', gap:'6px', marginTop:'3px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'10px', color:t.color }}>{t.label}</span>
              <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>· {fin.amortizacao}</span>
              <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>· {fin.taxaJuros}% a.a.</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:'18px', fontWeight:800, color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(fin.saldoDevedor)}</p>
          <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.35)' }}>saldo devedor</p>
        </div>
      </button>

      {open && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid rgba(255,255,255,0.05)', animation:'scaleIn 0.2s ease both' }}>
          {editing ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', paddingTop:'16px' }}>
              {[
                {label:'Nome',key:'nome',type:'text'},
                {label:'Saldo Devedor Atual (R$)',key:'saldoDevedor',type:'number'},
                {label:'Valor Original do Contrato (R$)',key:'valorOriginal',type:'number'},
                {label:'Taxa de Juros Anual (%)',key:'taxaJuros',type:'number'},
                {label:'Prazo Total (meses)',key:'prazoMeses',type:'number'},
                {label:'Parcela Mensal Atual (R$)',key:'parcelaMensal',type:'number'},
                {label:'Observação',key:'observacao',type:'text'},
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>{f.label}</label>
                  <input type={f.type} value={local[f.key]||''} onChange={e=>setLocal({...local,[f.key]:e.target.value})}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
                </div>
              ))}
              <div style={{ display:'flex', gap:'8px' }}>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Tipo</label>
                  <select value={local.tipo} onChange={e=>setLocal({...local,tipo:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                    {Object.entries(TIPOS).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                  </select>
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Sistema</label>
                  <select value={local.amortizacao} onChange={e=>setLocal({...local,amortizacao:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                    <option value="SAC">SAC — prestação decrescente</option>
                    <option value="PRICE">PRICE — prestação fixa</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={save} style={{ flex:1, background:`linear-gradient(135deg,${t.color},${t.color}aa)`, border:'none', borderRadius:'10px', padding:'10px', color:'#070b16', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Salvar</button>
                <button onClick={()=>setEditing(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ paddingTop:'16px' }}>
              {/* Progresso */}
              {fin.valorOriginal > 0 && <ProgressoFinanciamento fin={fin} />}

              {/* Tabs */}
              <div style={{ display:'flex', background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'3px', marginBottom:'16px' }}>
                {[['resumo','Resumo'],['tabela','Tabela'],['custos','Custos']].map(([k,l]) => (
                  <button key={k} onClick={()=>setTabView(k)} style={{
                    flex:1, background:tabView===k?'rgba(255,255,255,0.08)':'none',
                    border:'none', borderRadius:'8px', padding:'7px',
                    color:tabView===k?'#e2e8f0':'rgba(226,232,240,0.4)',
                    fontSize:'12px', fontWeight:tabView===k?600:400, cursor:'pointer',
                  }}>{l}</button>
                ))}
              </div>

              {tabView === 'resumo' && (
                <div>
                  {fin.observacao && <p style={{ fontSize:'12px', color:'rgba(226,232,240,0.4)', marginBottom:'12px', lineHeight:1.5, background:'rgba(255,255,255,0.02)', borderRadius:'8px', padding:'8px 10px' }}>{fin.observacao}</p>}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                    {[
                      {l:'Saldo Devedor',v:fmtD(fin.saldoDevedor),c:'#f87171'},
                      {l:'Taxa Mensal',v:fmtP(taxaMensal*100),c:t.color},
                      {l:'Parcela Atual',v:fmtD(fin.parcelaMensal),c:'#e2e8f0'},
                      {l:'Prazo Restante',v:`${fin.prazoMeses} meses`,c:'#fbbf24'},
                      {l:'Juros 1ª parcela',v:fmtD(primeiraP.juros||0),c:'#f87171'},
                      {l:'Amort. 1ª parcela',v:fmtD(primeiraP.amortizacao||0),c:'#6ee7b7'},
                      {l:'Total juros 12m',v:fmtD(totalJuros12),c:'#f87171'},
                      {l:'Total pago 12m',v:fmtD(totalPago12),c:'#fb923c'},
                    ].map(s => (
                      <div key={s.l} style={{ background:'rgba(255,255,255,0.02)', borderRadius:'9px', padding:'9px' }}>
                        <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.35)' }}>{s.l}</p>
                        <p style={{ fontSize:'12px', fontWeight:700, color:s.c, fontFamily:"'JetBrains Mono',monospace", marginTop:'3px' }}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:`${t.color}08`, border:`1px solid ${t.color}15`, borderRadius:'10px', padding:'10px 12px', marginBottom:'12px' }}>
                    <p style={{ fontSize:'11px', color:t.color, fontWeight:700, marginBottom:'4px' }}>📐 Sistema de Amortização: {fin.amortizacao}</p>
                    <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.5)', lineHeight:1.5 }}>
                      {fin.amortizacao==='SAC'
                        ? 'Amortização constante. Juros decrescentes → parcela inicial maior, parcelas menores com o tempo. Paga menos juros total.'
                        : 'Parcela fixa. Maior proporção de juros no início, amortização cresce com o tempo. Juros total maior que SAC.'}
                    </p>
                  </div>
                </div>
              )}

              {tabView === 'tabela' && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
                    <p style={{ fontSize:'12px', color:'rgba(226,232,240,0.5)' }}>Mostrar</p>
                    {[6,12,24,60].map(m => (
                      <button key={m} onClick={()=>setTabelaMeses(m)} style={{
                        background: tabelaMeses===m?`${t.color}20`:'rgba(255,255,255,0.04)',
                        border:`1px solid ${tabelaMeses===m?t.color:'rgba(255,255,255,0.08)'}`,
                        borderRadius:'8px', padding:'4px 10px', color: tabelaMeses===m?t.color:'rgba(226,232,240,0.4)',
                        fontSize:'11px', cursor:'pointer',
                      }}>{m}m</button>
                    ))}
                    <button onClick={()=>setTabelaMeses(fin.prazoMeses)} style={{
                      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                      borderRadius:'8px', padding:'4px 10px', color:'rgba(226,232,240,0.4)', fontSize:'11px', cursor:'pointer',
                    }}>Todos ({fin.prazoMeses})</button>
                  </div>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px', minWidth:'300px' }}>
                      <thead>
                        <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                          {['Mês','Parcela','Juros','Amort.','Saldo'].map(h => (
                            <th key={h} style={{ padding:'6px 4px', textAlign:'right', color:'rgba(226,232,240,0.4)', fontWeight:600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tabela.map((row,i) => (
                          <tr key={row.mes} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', background: i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                            <td style={{ padding:'5px 4px', textAlign:'right', color:'rgba(226,232,240,0.45)', fontWeight:500 }}>{row.mes}</td>
                            <td style={{ padding:'5px 4px', textAlign:'right', color:t.color, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>{fmt(row.prestacao)}</td>
                            <td style={{ padding:'5px 4px', textAlign:'right', color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(row.juros)}</td>
                            <td style={{ padding:'5px 4px', textAlign:'right', color:'#6ee7b7', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(row.amortizacao)}</td>
                            <td style={{ padding:'5px 4px', textAlign:'right', color:'rgba(226,232,240,0.7)', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(row.saldo)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop:'1px solid rgba(255,255,255,0.1)' }}>
                          <td style={{ padding:'7px 4px', textAlign:'right', color:'rgba(226,232,240,0.6)', fontWeight:700 }}>Σ</td>
                          <td style={{ padding:'7px 4px', textAlign:'right', color:t.color, fontFamily:"'JetBrains Mono',monospace", fontWeight:800 }}>{fmt(tabela.reduce((a,r)=>a+r.prestacao,0))}</td>
                          <td style={{ padding:'7px 4px', textAlign:'right', color:'#f87171', fontFamily:"'JetBrains Mono',monospace", fontWeight:800 }}>{fmt(tabela.reduce((a,r)=>a+r.juros,0))}</td>
                          <td style={{ padding:'7px 4px', textAlign:'right', color:'#6ee7b7', fontFamily:"'JetBrains Mono',monospace", fontWeight:800 }}>{fmt(tabela.reduce((a,r)=>a+r.amortizacao,0))}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {tabView === 'custos' && (
                <div>
                  <p style={{ fontSize:'12px', color:'rgba(226,232,240,0.4)', marginBottom:'10px' }}>Custos mensais adicionais à parcela</p>
                  {(fin.custos||[]).map((c,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize:'13px', color:'rgba(226,232,240,0.65)' }}>{c.nome}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'13px', fontWeight:700, color:'#fb923c', fontFamily:"'JetBrains Mono',monospace" }}>{fmtD(c.valor)}</span>
                        <button onClick={()=>removeCusto(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,113,113,0.35)', fontSize:'12px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding:'10px 0', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(226,232,240,0.7)' }}>Custo Total Mensal</span>
                      <span style={{ fontSize:'15px', fontWeight:800, color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>{fmtD(fin.parcelaMensal + custosTotais)}</span>
                    </div>
                    <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)', marginTop:'3px' }}>Parcela {fmtD(fin.parcelaMensal)} + Custos {fmtD(custosTotais)}</p>
                  </div>

                  {addingCusto ? (
                    <div style={{ display:'flex', gap:'6px', marginTop:'8px', alignItems:'center' }}>
                      <input placeholder="Nome do custo" value={novoCusto.nome} onChange={e=>setNovoCusto({...novoCusto,nome:e.target.value})}
                        style={{ flex:2, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'7px 10px', color:'#e2e8f0', fontSize:'12px' }} />
                      <input type="number" placeholder="R$" value={novoCusto.valor} onChange={e=>setNovoCusto({...novoCusto,valor:e.target.value})}
                        style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'7px 10px', color:'#e2e8f0', fontSize:'12px', fontFamily:"'JetBrains Mono',monospace" }} />
                      <button onClick={addCusto} style={{ background:`${t.color}20`, border:`1px solid ${t.color}35`, borderRadius:'8px', padding:'7px 10px', color:t.color, cursor:'pointer', fontSize:'12px', fontWeight:700 }}>+</button>
                      <button onClick={()=>setAddingCusto(false)} style={{ background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'8px', padding:'7px 10px', color:'rgba(226,232,240,0.5)', cursor:'pointer', fontSize:'12px' }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={()=>setAddingCusto(true)} style={{ width:'100%', background:`${t.color}07`, border:`1px dashed ${t.color}20`, borderRadius:'8px', padding:'8px', color:t.color, fontSize:'12px', cursor:'pointer', marginTop:'8px' }}>
                      + Adicionar custo (seguro, taxa, etc.)
                    </button>
                  )}
                </div>
              )}

              {/* Ações */}
              <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
                <button onClick={()=>{setLocal({...fin});setEditing(true)}} style={{ flex:1, background:`${t.color}12`, border:`1px solid ${t.color}20`, borderRadius:'10px', padding:'9px', color:t.color, cursor:'pointer', fontSize:'12px' }}>✏️ Editar</button>
                <button onClick={()=>onRemove(fin.id)} style={{ flex:1, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:'10px', padding:'9px', color:'#f87171', cursor:'pointer', fontSize:'12px' }}>🗑️ Remover</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Financiamentos() {
  const { financiamentos, addFinanciamento, updateFinanciamento, removeFinanciamento } = useFinancasStore()
  const [showAdd, setShowAdd] = useState(false)
  const [novo, setNovo] = useState({ nome:'', tipo:'imovel', saldoDevedor:'', valorOriginal:'', taxaJuros:'', prazoMeses:'', parcelaMensal:'', amortizacao:'SAC', observacao:'', custos:[] })

  const totalDivida   = financiamentos.reduce((a,f)=>a+f.saldoDevedor,0)
  const totalParcelas = financiamentos.reduce((a,f)=>a+f.parcelaMensal,0)
  const totalCustos   = financiamentos.reduce((a,f)=>a+(f.custos||[]).reduce((b,c)=>b+c.valor,0),0)

  const add = () => {
    if (!novo.nome || !novo.saldoDevedor) return
    addFinanciamento({ ...novo, saldoDevedor:parseFloat(novo.saldoDevedor), valorOriginal:parseFloat(novo.valorOriginal)||parseFloat(novo.saldoDevedor), taxaJuros:parseFloat(novo.taxaJuros), prazoMeses:parseInt(novo.prazoMeses), parcelaMensal:parseFloat(novo.parcelaMensal)||0, custos:[] })
    setNovo({ nome:'', tipo:'imovel', saldoDevedor:'', valorOriginal:'', taxaJuros:'', prazoMeses:'', parcelaMensal:'', amortizacao:'SAC', observacao:'', custos:[] })
    setShowAdd(false)
  }

  return (
    <div style={{ padding:'0 0 8px' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0d1526,#070b16)', padding:'52px 20px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'radial-gradient(circle,rgba(248,113,113,0.07) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ animation:'fadeUp 0.5s ease both' }}>
          <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'4px' }}>Módulo</p>
          <h1 style={{ fontSize:'26px', fontWeight:800, letterSpacing:'-0.02em' }}>Financiamentos</h1>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:'16px', animation:'fadeUp 0.5s ease 0.1s both' }}>
          {[
            {label:'Total em Dívidas',value:fmt(totalDivida),color:'#f87171'},
            {label:'Parcelas/mês',value:fmt(totalParcelas),color:'#fb923c'},
            {label:'Custos adicionais',value:fmt(totalCustos),color:'#fbbf24'},
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'10px 8px', textAlign:'center' }}>
              <p style={{ fontSize:'14px', fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</p>
              <p style={{ fontSize:'9px', color:'rgba(226,232,240,0.35)', marginTop:'3px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'12px', animation:'fadeUp 0.5s ease 0.15s both' }}>
          <button onClick={()=>setShowAdd(!showAdd)} style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'10px', padding:'8px 14px', color:'#f87171', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            + Novo Financiamento
          </button>
        </div>

        {showAdd && (
          <div style={{ background:'#111827', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'16px', padding:'16px', marginBottom:'12px', animation:'scaleIn 0.2s ease both' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'#f87171', marginBottom:'12px' }}>Novo Financiamento</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <div>
                  <label style={{ fontSize:'10px', color:'rgba(226,232,240,0.4)', display:'block', marginBottom:'3px' }}>Tipo</label>
                  <select value={novo.tipo} onChange={e=>setNovo({...novo,tipo:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 10px', color:'#e2e8f0', fontSize:'12px' }}>
                    {Object.entries(TIPOS).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:'10px', color:'rgba(226,232,240,0.4)', display:'block', marginBottom:'3px' }}>Sistema</label>
                  <select value={novo.amortizacao} onChange={e=>setNovo({...novo,amortizacao:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 10px', color:'#e2e8f0', fontSize:'12px' }}>
                    <option value="SAC">SAC</option>
                    <option value="PRICE">PRICE</option>
                  </select>
                </div>
              </div>
              {[
                {label:'Nome',key:'nome',type:'text',full:true},
                {label:'Saldo Devedor (R$)',key:'saldoDevedor',type:'number'},
                {label:'Valor Original (R$)',key:'valorOriginal',type:'number'},
                {label:'Taxa Juros Anual (%)',key:'taxaJuros',type:'number'},
                {label:'Prazo (meses)',key:'prazoMeses',type:'number'},
                {label:'Parcela Mensal (R$)',key:'parcelaMensal',type:'number'},
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : undefined }}>
                  <label style={{ fontSize:'10px', color:'rgba(226,232,240,0.4)', display:'block', marginBottom:'3px' }}>{f.label}</label>
                  <input type={f.type} value={novo[f.key]} onChange={e=>setNovo({...novo,[f.key]:e.target.value})}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
                </div>
              ))}
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={add} style={{ flex:1, background:'linear-gradient(135deg,#f87171,#fb923c)', border:'none', borderRadius:'10px', padding:'10px', color:'#070b16', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Adicionar</button>
                <button onClick={()=>setShowAdd(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {financiamentos.map((fin,i) => (
          <div key={fin.id} style={{ animation:`fadeUp 0.5s ease ${0.2+i*0.06}s both` }}>
            <FinCard fin={fin} onUpdate={updateFinanciamento} onRemove={removeFinanciamento} />
          </div>
        ))}
      </div>
    </div>
  )
}
