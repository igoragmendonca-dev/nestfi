import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import useFinancasStore from '../store'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(v||0)
const fmtD = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v||0)
const fmtP = (v) => `${(v||0).toFixed(2)}%`

const TIPOS = {
  acoes:            { label:'Ações',           emoji:'📈', color:'#6ee7b7', aliquota:0.15,  desc:'IR 15% sobre ganho de capital (venda > R$20k/mês)' },
  fundoImobiliario: { label:'FIIs',            emoji:'🏢', color:'#34d399', aliquota:0,     desc:'Isento IR — pessoa física (Lei 11.033/04)' },
  tesouro:          { label:'Tesouro Direto',  emoji:'🏛️', color:'#818cf8', aliquota:0.15,  desc:'IR 15% sobre rendimento (prazo > 720 dias)' },
  cdb:              { label:'CDB / LCI / LCA', emoji:'🏦', color:'#a78bfa', aliquota:0.15,  desc:'IR regressivo até 15% (> 720 dias)' },
  contaCorrente:    { label:'Conta Corrente',  emoji:'💳', color:'#64748b', aliquota:0,     desc:'Sem rendimento — liquidez imediata' },
  contaInvestimento:{ label:'C. Investimento', emoji:'💰', color:'#fbbf24', aliquota:0.155, desc:'IOF regressivo + IR sobre CDI' },
  fgts:             { label:'FGTS',            emoji:'🛡️', color:'#fb923c', aliquota:0,     desc:'TR + 3% a.a. — resgate restrito' },
  previdencia:      { label:'Previdência',     emoji:'👴', color:'#f472b6', aliquota:0.10,  desc:'IR 10% tabela regressiva (> 10 anos)' },
}

function calcGanhos(inv) {
  const t = TIPOS[inv.tipo]
  if (!t) return { ganho:0, ir:0, liquido:inv.valor }
  const ganho = inv.valor * (inv.rentabilidadeAnual/100)
  const ir    = ganho * t.aliquota
  return { ganho, ir, liquido: inv.valor + ganho - ir }
}

const PieTooltip = ({ active, payload }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'rgba(7,11,22,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 14px' }}>
      <p style={{ fontSize:'12px', fontWeight:700, color:payload[0].payload.color }}>{payload[0].name}</p>
      <p style={{ fontSize:'13px', fontWeight:800, color:'#e2e8f0', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(payload[0].value)}</p>
      <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.5)' }}>{payload[0].payload.pct}%</p>
    </div>
  )
}

function InvCard({ inv, onUpdate, onRemove }) {
  const [open, setOpen]     = useState(false)
  const [editing, setEditing] = useState(false)
  const [local, setLocal]   = useState({ ...inv })

  const t = TIPOS[inv.tipo] || TIPOS.acoes
  const { ganho, ir } = calcGanhos(inv)

  const save = () => {
    onUpdate(inv.id, { ...local, valor:parseFloat(local.valor)||0, rentabilidadeAnual:parseFloat(local.rentabilidadeAnual)||0, quantidade:parseFloat(local.quantidade)||0, precoMedio:parseFloat(local.precoMedio)||0 })
    setEditing(false)
  }

  return (
    <div style={{ background:'linear-gradient(135deg,#111827,#0d1422)', border:`1px solid ${t.color}18`, borderRadius:'16px', overflow:'hidden', marginBottom:'10px' }}>
      <button onClick={()=>setOpen(!open)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', padding:'13px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', textAlign:'left' }}>
          <span style={{ width:'36px', height:'36px', background:`${t.color}18`, border:`1px solid ${t.color}28`, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', flexShrink:0 }}>{t.emoji}</span>
          <div>
            <p style={{ fontSize:'13px', fontWeight:700, color:'#e2e8f0' }}>{inv.nome}</p>
            <div style={{ display:'flex', gap:'5px', marginTop:'2px' }}>
              <span style={{ fontSize:'10px', color:t.color }}>{t.label}</span>
              {inv.corretora && <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>· {inv.corretora}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <p style={{ fontSize:'14px', fontWeight:800, color:t.color, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(inv.valor)}</p>
          <p style={{ fontSize:'10px', color:'#6ee7b7' }}>+{fmtP(inv.rentabilidadeAnual)} a.a.</p>
        </div>
      </button>

      {open && (
        <div style={{ padding:'0 16px 14px', borderTop:'1px solid rgba(255,255,255,0.05)', animation:'scaleIn 0.2s ease both' }}>
          {editing ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', paddingTop:'12px' }}>
              {[{label:'Nome',key:'nome',type:'text'},{label:'Valor Atual (R$)',key:'valor',type:'number'},{label:'Rentab. Anual (%)',key:'rentabilidadeAnual',type:'number'},{label:'Quantidade',key:'quantidade',type:'number'},{label:'Preço Médio (R$)',key:'precoMedio',type:'number'},{label:'Corretora',key:'corretora',type:'text'},{label:'Descrição',key:'descricao',type:'text'}].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'3px' }}>{f.label}</label>
                  <input type={f.type} value={local[f.key]||''} onChange={e=>setLocal({...local,[f.key]:e.target.value})}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'3px' }}>Tipo</label>
                <select value={local.tipo} onChange={e=>setLocal({...local,tipo:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                  {Object.entries(TIPOS).map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={save} style={{ flex:1, background:`${t.color}20`, border:`1px solid ${t.color}35`, borderRadius:'10px', padding:'9px', color:t.color, fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Salvar</button>
                <button onClick={()=>setEditing(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'9px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ paddingTop:'12px' }}>
              {inv.descricao && <p style={{ fontSize:'12px', color:'rgba(226,232,240,0.4)', marginBottom:'10px' }}>{inv.descricao}</p>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px', marginBottom:'10px' }}>
                {[
                  {l:'Ganho bruto/ano', v:fmtD(ganho), c:'#fbbf24'},
                  {l:'IR estimado/ano', v:fmtD(ir), c: ir>0?'#f87171':'#64748b'},
                  {l:'Ganho líq./ano', v:fmtD(ganho-ir), c:'#34d399'},
                  {l:'Ganho líq./mês', v:fmtD((ganho-ir)/12), c:'#6ee7b7'},
                  ...(inv.quantidade?[{l:'Quantidade',v:inv.quantidade?.toLocaleString('pt-BR'),c:t.color}]:[]),
                  ...(inv.precoMedio?[{l:'Preço médio',v:fmtD(inv.precoMedio),c:t.color}]:[]),
                ].map(s=>(
                  <div key={s.l} style={{ background:'rgba(255,255,255,0.02)', borderRadius:'8px', padding:'8px' }}>
                    <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.35)' }}>{s.l}</p>
                    <p style={{ fontSize:'12px', fontWeight:700, color:s.c, fontFamily:"'JetBrains Mono',monospace", marginTop:'2px' }}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div style={{ background:`${t.color}08`, border:`1px solid ${t.color}15`, borderRadius:'8px', padding:'8px 10px', marginBottom:'10px' }}>
                <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.5)', lineHeight:1.4 }}>{t.desc}</p>
              </div>
              {inv.vencimento && <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', marginBottom:'10px' }}>📅 Venc.: {new Date(inv.vencimento).toLocaleDateString('pt-BR')}</p>}
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={()=>{setLocal({...inv});setEditing(true)}} style={{ flex:1, background:`${t.color}12`, border:`1px solid ${t.color}20`, borderRadius:'10px', padding:'8px', color:t.color, cursor:'pointer', fontSize:'12px' }}>✏️ Editar</button>
                <button onClick={()=>onRemove(inv.id)} style={{ flex:1, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:'10px', padding:'8px', color:'#f87171', cursor:'pointer', fontSize:'12px' }}>🗑️ Remover</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Investimentos() {
  const { investimentos, addInvestimento, updateInvestimento, removeInvestimento } = useFinancasStore()
  const [showAdd, setShowAdd] = useState(false)
  const [filtro, setFiltro]   = useState('todos')
  const [novo, setNovo]       = useState({ nome:'', tipo:'acoes', valor:'', rentabilidadeAnual:'', descricao:'', corretora:'', quantidade:'', precoMedio:'' })

  const total = useMemo(()=>investimentos.reduce((a,i)=>a+i.valor,0),[investimentos])
  const totalGanhoLiq = useMemo(()=>investimentos.reduce((a,i)=>{ const {ganho,ir}=calcGanhos(i); return a+ganho-ir },0),[investimentos])

  const pieData = useMemo(()=>{
    const groups={}
    investimentos.forEach(inv=>{ if(!groups[inv.tipo]) groups[inv.tipo]=0; groups[inv.tipo]+=inv.valor })
    return Object.entries(groups).filter(([,v])=>v>0).map(([tipo,valor])=>({
      name: TIPOS[tipo]?.label||tipo, value:valor, color:TIPOS[tipo]?.color||'#6ee7b7',
      pct: total>0?((valor/total)*100).toFixed(1):0,
    })).sort((a,b)=>b.value-a.value)
  },[investimentos,total])

  const filtered = filtro==='todos' ? investimentos : investimentos.filter(i=>i.tipo===filtro)

  const add = () => {
    if (!novo.nome||!novo.valor) return
    addInvestimento({ ...novo, valor:parseFloat(novo.valor), rentabilidadeAnual:parseFloat(novo.rentabilidadeAnual)||0, quantidade:parseFloat(novo.quantidade)||0, precoMedio:parseFloat(novo.precoMedio)||0 })
    setNovo({ nome:'', tipo:'acoes', valor:'', rentabilidadeAnual:'', descricao:'', corretora:'', quantidade:'', precoMedio:'' })
    setShowAdd(false)
  }

  return (
    <div style={{ padding:'0 0 8px' }}>
      {/* Header sem título */}
      <div style={{ background:'linear-gradient(160deg,#0d1526,#070b16)', padding:'48px 20px 20px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'radial-gradient(circle,rgba(129,140,248,0.08) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', animation:'fadeUp 0.5s ease both' }}>
          <div>
            <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Total Investido</p>
            <p style={{ fontSize:'30px', fontWeight:800, color:'#818cf8', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em', marginTop:'4px' }}>{fmt(total)}</p>
            <p style={{ fontSize:'12px', color:'#6ee7b7', marginTop:'4px' }}>+{fmt(totalGanhoLiq)}/ano líquido</p>
          </div>
          <button onClick={()=>setShowAdd(!showAdd)} style={{ background:'rgba(129,140,248,0.12)', border:'1px solid rgba(129,140,248,0.22)', borderRadius:'12px', padding:'8px 14px', color:'#818cf8', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>+ Novo</button>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Pie chart */}
        <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'18px', padding:'16px', marginBottom:'14px', animation:'fadeUp 0.5s ease 0.1s both' }}>
          <p style={{ fontSize:'12px', fontWeight:600, color:'rgba(226,232,240,0.6)', marginBottom:'10px' }}>Alocação por tipo</p>
          <div style={{ display:'flex', alignItems:'center' }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={pieData} cx={60} cy={60} innerRadius={36} outerRadius={60} dataKey="value" paddingAngle={2}>
                  {pieData.map((e,i)=><Cell key={i} fill={e.color} stroke="transparent"/>)}
                </Pie>
                <Tooltip content={<PieTooltip />}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'5px' }}>
              {pieData.map(d=>(
                <div key={d.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:d.color, flexShrink:0 }} />
                    <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.6)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize:'11px', color:d.color, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'6px', marginBottom:'12px', animation:'fadeUp 0.5s ease 0.15s both' }}>
          <button onClick={()=>setFiltro('todos')} style={{ background:filtro==='todos'?'rgba(129,140,248,0.18)':'rgba(255,255,255,0.03)', border:`1px solid ${filtro==='todos'?'#818cf8':'rgba(255,255,255,0.07)'}`, borderRadius:'20px', padding:'5px 12px', color:filtro==='todos'?'#818cf8':'rgba(226,232,240,0.4)', fontSize:'11px', cursor:'pointer', whiteSpace:'nowrap' }}>
            Todos ({investimentos.length})
          </button>
          {Object.entries(TIPOS).filter(([k])=>investimentos.some(i=>i.tipo===k)).map(([k,v])=>(
            <button key={k} onClick={()=>setFiltro(k)} style={{ background:filtro===k?`${v.color}18`:'rgba(255,255,255,0.03)', border:`1px solid ${filtro===k?v.color:'rgba(255,255,255,0.07)'}`, borderRadius:'20px', padding:'5px 10px', color:filtro===k?v.color:'rgba(226,232,240,0.4)', fontSize:'10px', cursor:'pointer', whiteSpace:'nowrap' }}>
              {v.emoji} {v.label}
            </button>
          ))}
        </div>

        {/* Form novo */}
        {showAdd && (
          <div style={{ background:'#111827', border:'1px solid rgba(129,140,248,0.2)', borderRadius:'16px', padding:'16px', marginBottom:'12px', animation:'scaleIn 0.2s ease both' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'#818cf8', marginBottom:'12px' }}>Novo Investimento</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'3px' }}>Tipo</label>
                <select value={novo.tipo} onChange={e=>setNovo({...novo,tipo:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                  {Object.entries(TIPOS).map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              {[{label:'Nome / Ticker',key:'nome',type:'text'},{label:'Valor Atual (R$)',key:'valor',type:'number'},{label:'Rentab. Anual (%)',key:'rentabilidadeAnual',type:'number'},{label:'Corretora',key:'corretora',type:'text'},{label:'Descrição',key:'descricao',type:'text'}].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'3px' }}>{f.label}</label>
                  <input type={f.type} value={novo[f.key]} onChange={e=>setNovo({...novo,[f.key]:e.target.value})}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
                </div>
              ))}
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={add} style={{ flex:1, background:'linear-gradient(135deg,#818cf8,#a78bfa)', border:'none', borderRadius:'10px', padding:'10px', color:'#070b16', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Adicionar</button>
                <button onClick={()=>setShowAdd(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {filtered.map((inv,i)=>(
          <div key={inv.id} style={{ animation:`fadeUp 0.4s ease ${i*0.03}s both` }}>
            <InvCard inv={inv} onUpdate={updateInvestimento} onRemove={removeInvestimento} />
          </div>
        ))}
      </div>
    </div>
  )
}
