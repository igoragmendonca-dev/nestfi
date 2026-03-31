import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import useFinancasStore from '../store'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0)
const fmtD = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtP = (v) => `${(v||0).toFixed(2)}%`

const TIPOS = {
  acoes:            { label: 'Ações',           emoji: '📈', color: '#6ee7b7', aliquota: 0.15,  custosDesc: 'IR 15% sobre ganho de capital (venda > R$20k/mês)' },
  fundoImobiliario: { label: 'FIIs',            emoji: '🏢', color: '#34d399', aliquota: 0,     custosDesc: 'Isento de IR para pessoa física (Lei 11.033/04)' },
  tesouro:          { label: 'Tesouro Direto',  emoji: '🏛️', color: '#818cf8', aliquota: 0.15,  custosDesc: 'IR 15% sobre rendimento (prazo > 720 dias)' },
  cdb:              { label: 'CDB / LCI / LCA', emoji: '🏦', color: '#a78bfa', aliquota: 0.15,  custosDesc: 'IR regressivo: 22.5%→20%→17.5%→15% (>720 dias)' },
  contaCorrente:    { label: 'Conta Corrente',  emoji: '💳', color: '#64748b', aliquota: 0,     custosDesc: 'Sem rendimento — mantido para liquidez' },
  contaInvestimento:{ label: 'C. Investimento', emoji: '💰', color: '#fbbf24', aliquota: 0.155, custosDesc: 'IOF regressivo + IR sobre CDI' },
  fgts:             { label: 'FGTS',            emoji: '🛡️', color: '#fb923c', aliquota: 0,     custosDesc: 'TR + 3% a.a. — resgate restrito (demissão/casa própria)' },
  previdencia:      { label: 'Previdência',     emoji: '👴', color: '#f472b6', aliquota: 0.10,  custosDesc: 'IR 10% tabela regressiva (PGBL/VGBL > 10 anos)' },
}

function calcGanhos(inv) {
  const t = TIPOS[inv.tipo]
  if (!t) return { ganho: 0, ir: 0, liquido: inv.valor }
  const ganho = inv.valor * (inv.rentabilidadeAnual / 100)
  const ir    = ganho * t.aliquota
  return { ganho, ir, liquido: inv.valor + ganho - ir }
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(7,11,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px' }}>
      <p style={{ fontSize: '12px', fontWeight: 700, color: payload[0].payload.color }}>{payload[0].name}</p>
      <p style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>{fmt(payload[0].value)}</p>
      <p style={{ fontSize: '11px', color: 'rgba(226,232,240,0.5)' }}>{payload[0].payload.pct}%</p>
    </div>
  )
}

function InvCard({ inv, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({ ...inv })

  const t = TIPOS[inv.tipo] || TIPOS.acoes
  const { ganho, ir, liquido } = calcGanhos(inv)
  const ganhoMensal = ganho / 12

  const save = () => {
    onUpdate(inv.id, {
      ...local,
      valor: parseFloat(local.valor) || 0,
      rentabilidadeAnual: parseFloat(local.rentabilidadeAnual) || 0,
      quantidade: parseFloat(local.quantidade) || 0,
      precoMedio: parseFloat(local.precoMedio) || 0,
    })
    setEditing(false)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #111827, #0d1422)',
      border: `1px solid ${t.color}18`, borderRadius: '18px',
      overflow: 'hidden', marginBottom: '10px',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
          <span style={{
            width: '38px', height: '38px',
            background: `${t.color}18`, border: `1px solid ${t.color}28`,
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', flexShrink: 0,
            boxShadow: `0 2px 8px ${t.color}20`,
          }}>{t.emoji}</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{inv.nome}</p>
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: t.color }}>{t.label}</span>
              {inv.corretora && <span style={{ fontSize: '10px', color: 'rgba(226,232,240,0.3)' }}>· {inv.corretora}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 800, color: t.color, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(inv.valor)}</p>
          <p style={{ fontSize: '10px', color: '#6ee7b7' }}>+{fmtP(inv.rentabilidadeAnual)} a.a.</p>
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', animation: 'scaleIn 0.2s ease both' }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '14px' }}>
              {[
                { label: 'Nome / Ticker', key: 'nome', type: 'text' },
                { label: 'Valor Atual (R$)', key: 'valor', type: 'number' },
                { label: 'Rentabilidade Anual (%)', key: 'rentabilidadeAnual', type: 'number' },
                { label: 'Quantidade', key: 'quantidade', type: 'number' },
                { label: 'Preço Médio (R$)', key: 'precoMedio', type: 'number' },
                { label: 'Corretora', key: 'corretora', type: 'text' },
                { label: 'Descrição', key: 'descricao', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '11px', color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                  <input type={f.type} value={local[f.key]||''} onChange={e=>setLocal({...local,[f.key]:e.target.value})}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: '4px' }}>Tipo</label>
                <select value={local.tipo} onChange={e=>setLocal({...local,tipo:e.target.value})}
                  style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                  {Object.entries(TIPOS).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={save} style={{ flex:1, background:`linear-gradient(135deg,${t.color},${t.color}aa)`, border:'none', borderRadius:'10px', padding:'10px', color:'#070b16', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Salvar</button>
                <button onClick={()=>setEditing(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ paddingTop: '14px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(226,232,240,0.4)', marginBottom: '10px', lineHeight: 1.5 }}>{inv.descricao}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                {[
                  { label: 'Capital investido', value: fmtD(inv.valor), color: '#e2e8f0' },
                  { label: 'Rent. anual', value: fmtP(inv.rentabilidadeAnual), color: '#6ee7b7' },
                  { label: 'Ganho bruto/ano', value: fmtD(ganho), color: '#fbbf24' },
                  { label: 'IR estimado/ano', value: fmtD(ir), color: ir > 0 ? '#f87171' : '#64748b' },
                  { label: 'Ganho líq./ano', value: fmtD(ganho - ir), color: '#34d399' },
                  { label: 'Ganho líq./mês', value: fmtD(ganhoMensal * (1 - (TIPOS[inv.tipo]?.aliquota||0))), color: '#6ee7b7' },
                  ...(inv.quantidade ? [{ label: 'Quantidade', value: inv.quantidade?.toLocaleString('pt-BR'), color: t.color }] : []),
                  ...(inv.precoMedio ? [{ label: 'Preço médio', value: fmtD(inv.precoMedio), color: t.color }] : []),
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '8px' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(226,232,240,0.35)' }}>{s.label}</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: `${t.color}08`, border: `1px solid ${t.color}15`, borderRadius: '8px', padding: '8px 10px', marginBottom: '10px' }}>
                <p style={{ fontSize: '10px', color: t.color, fontWeight: 600 }}>📋 Tributação</p>
                <p style={{ fontSize: '11px', color: 'rgba(226,232,240,0.5)', marginTop: '3px', lineHeight: 1.4 }}>{t.custosDesc}</p>
              </div>
              {inv.vencimento && (
                <p style={{ fontSize: '11px', color: 'rgba(226,232,240,0.4)', marginBottom: '10px' }}>
                  📅 Vencimento: {new Date(inv.vencimento).toLocaleDateString('pt-BR')}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
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
  const [filtro, setFiltro] = useState('todos')
  const [novo, setNovo] = useState({ nome: '', tipo: 'acoes', valor: '', rentabilidadeAnual: '', descricao: '', corretora: '', quantidade: '', precoMedio: '' })

  const total = useMemo(() => investimentos.reduce((a,i)=>a+i.valor,0), [investimentos])

  const totalGanho = useMemo(() => investimentos.reduce((a,i)=>{
    const {ganho,ir} = calcGanhos(i)
    return a + ganho - ir
  },0), [investimentos])

  const totalIR = useMemo(() => investimentos.reduce((a,i)=>a+calcGanhos(i).ir,0), [investimentos])

  // Pie chart data
  const pieData = useMemo(() => {
    const groups = {}
    investimentos.forEach(inv => {
      if (!groups[inv.tipo]) groups[inv.tipo] = 0
      groups[inv.tipo] += inv.valor
    })
    return Object.entries(groups)
      .filter(([,v]) => v > 0)
      .map(([tipo,valor]) => ({
        name: TIPOS[tipo]?.label || tipo,
        value: valor,
        color: TIPOS[tipo]?.color || '#6ee7b7',
        pct: total > 0 ? ((valor/total)*100).toFixed(1) : 0,
      }))
      .sort((a,b) => b.value - a.value)
  }, [investimentos, total])

  const filtered = filtro === 'todos' ? investimentos : investimentos.filter(i=>i.tipo===filtro)

  const add = () => {
    if (!novo.nome || !novo.valor) return
    addInvestimento({
      ...novo,
      valor: parseFloat(novo.valor),
      rentabilidadeAnual: parseFloat(novo.rentabilidadeAnual) || 0,
      quantidade: parseFloat(novo.quantidade) || 0,
      precoMedio: parseFloat(novo.precoMedio) || 0,
    })
    setNovo({ nome: '', tipo: 'acoes', valor: '', rentabilidadeAnual: '', descricao: '', corretora: '', quantidade: '', precoMedio: '' })
    setShowAdd(false)
  }

  return (
    <div style={{ padding: '0 0 8px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0d1526, #070b16)', padding: '52px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'radial-gradient(circle,rgba(129,140,248,0.08) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ animation: 'fadeUp 0.5s ease both' }}>
          <p style={{ fontSize: '11px', color: 'rgba(226,232,240,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Módulo</p>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>Investimentos</h1>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '16px', animation: 'fadeUp 0.5s ease 0.1s both' }}>
          {[
            { label: 'Capital Total', value: fmt(total), color: '#818cf8' },
            { label: 'Ganho Líq./ano', value: fmt(totalGanho), color: '#6ee7b7' },
            { label: 'IR Estimado/ano', value: fmt(totalIR), color: '#f87171' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'12px 8px', textAlign:'center' }}>
              <p style={{ fontSize:'13px', fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</p>
              <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.35)', marginTop:'3px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Pie chart alocação */}
        <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'18px', marginBottom:'16px', animation:'fadeUp 0.5s ease 0.15s both' }}>
          <p style={{ fontSize:'13px', fontWeight:600, color:'rgba(226,232,240,0.7)', marginBottom:'4px' }}>Alocação por Tipo</p>
          <div style={{ display:'flex', alignItems:'center', gap:'0' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'5px' }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:d.color, flexShrink:0 }} />
                    <span style={{ fontSize:'11px', color:'rgba(226,232,240,0.6)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize:'11px', color:d.color, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'6px', marginBottom:'12px', animation:'fadeUp 0.5s ease 0.2s both' }}>
          <button onClick={()=>setFiltro('todos')} style={{ background:filtro==='todos'?'rgba(129,140,248,0.18)':'rgba(255,255,255,0.03)', border:`1px solid ${filtro==='todos'?'#818cf8':'rgba(255,255,255,0.07)'}`, borderRadius:'20px', padding:'6px 12px', color:filtro==='todos'?'#818cf8':'rgba(226,232,240,0.4)', fontSize:'12px', cursor:'pointer', whiteSpace:'nowrap' }}>
            Todos ({investimentos.length})
          </button>
          {Object.entries(TIPOS).filter(([k])=>investimentos.some(i=>i.tipo===k)).map(([k,v]) => (
            <button key={k} onClick={()=>setFiltro(k)} style={{ background:filtro===k?`${v.color}18`:'rgba(255,255,255,0.03)', border:`1px solid ${filtro===k?v.color:'rgba(255,255,255,0.07)'}`, borderRadius:'20px', padding:'6px 12px', color:filtro===k?v.color:'rgba(226,232,240,0.4)', fontSize:'11px', cursor:'pointer', whiteSpace:'nowrap' }}>
              {v.emoji} {v.label}
            </button>
          ))}
        </div>

        {/* Botão adicionar */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'12px', animation:'fadeUp 0.5s ease 0.22s both' }}>
          <button onClick={()=>setShowAdd(!showAdd)} style={{ background:'rgba(129,140,248,0.12)', border:'1px solid rgba(129,140,248,0.22)', borderRadius:'10px', padding:'8px 14px', color:'#818cf8', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            + Novo Ativo
          </button>
        </div>

        {showAdd && (
          <div style={{ background:'#111827', border:'1px solid rgba(129,140,248,0.2)', borderRadius:'16px', padding:'16px', marginBottom:'12px', animation:'scaleIn 0.2s ease both' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'#818cf8', marginBottom:'12px' }}>Novo Investimento</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Tipo</label>
                <select value={novo.tipo} onChange={e=>setNovo({...novo,tipo:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                  {Object.entries(TIPOS).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              {[
                {label:'Nome / Ticker',key:'nome',type:'text'},
                {label:'Valor Atual (R$)',key:'valor',type:'number'},
                {label:'Rentabilidade Anual (%)',key:'rentabilidadeAnual',type:'number'},
                {label:'Corretora',key:'corretora',type:'text'},
                {label:'Descrição',key:'descricao',type:'text'},
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>{f.label}</label>
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
        {filtered.map((inv,i) => (
          <div key={inv.id} style={{ animation:`fadeUp 0.5s ease ${0.25+i*0.03}s both` }}>
            <InvCard inv={inv} onUpdate={updateInvestimento} onRemove={removeInvestimento} />
          </div>
        ))}
      </div>
    </div>
  )
}
