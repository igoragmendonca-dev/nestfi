import { useState, useMemo } from 'react'
import useFinancasStore from '../store'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v||0)

const CAT_META = {
  'Streaming':    { color:'#818cf8', emoji:'🎬' },
  'Pontos/Milhas':{ color:'#fbbf24', emoji:'✈️' },
  'Música':       { color:'#34d399', emoji:'🎵' },
  'Games':        { color:'#f472b6', emoji:'🎮' },
  'Compras':      { color:'#fb923c', emoji:'🛍️' },
  'Mobilidade':   { color:'#60a5fa', emoji:'🚗' },
  'Notícias':     { color:'#94a3b8', emoji:'📰' },
  'Tech':         { color:'#a78bfa', emoji:'📱' },
  'Lazer':        { color:'#f87171', emoji:'🎉' },
  'Outros':       { color:'#6ee7b7', emoji:'📦' },
}
const CATS = Object.keys(CAT_META)

function AssCard({ ass, onUpdate, onRemove, onToggle }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({ ...ass })
  const meta  = CAT_META[ass.categoria] || CAT_META['Outros']
  const color = meta.color

  const save = () => { onUpdate(ass.id, { ...local, valor:parseFloat(local.valor)||0, vencimento:parseInt(local.vencimento)||0 }); setEditing(false) }

  if (editing) return (
    <div style={{ background:'#111827', border:`1px solid ${color}25`, borderRadius:'14px', padding:'14px', marginBottom:'8px' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {[{label:'Nome',key:'nome',type:'text'},{label:'Valor Mensal (R$)',key:'valor',type:'number'},{label:'Dia vencimento',key:'vencimento',type:'number'},{label:'Observação',key:'observacao',type:'text'}].map(f=>(
          <input key={f.key} type={f.type} placeholder={f.label} value={local[f.key]||''}
            onChange={e=>setLocal({...local,[f.key]:e.target.value})}
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
        ))}
        <select value={local.categoria} onChange={e=>setLocal({...local,categoria:e.target.value})}
          style={{ background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
          {CATS.map(c=><option key={c} value={c}>{CAT_META[c].emoji} {c}</option>)}
        </select>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={save} style={{ flex:1, background:`${color}22`, border:`1px solid ${color}35`, borderRadius:'8px', padding:'9px', color, fontWeight:700, cursor:'pointer', fontSize:'12px' }}>Salvar</button>
          <button onClick={()=>setEditing(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'8px', padding:'9px', color:'rgba(226,232,240,0.5)', cursor:'pointer', fontSize:'12px' }}>Cancelar</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: ass.ativa?'linear-gradient(135deg,#111827,#0d1422)':'rgba(255,255,255,0.02)', border:`1px solid ${ass.ativa?color+'18':'rgba(255,255,255,0.05)'}`, borderRadius:'14px', padding:'12px 14px', marginBottom:'8px', opacity:ass.ativa?1:0.55, transition:'all 0.2s' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={()=>onToggle(ass.id)} style={{ width:'36px', height:'20px', borderRadius:'10px', border:'none', cursor:'pointer', background:ass.ativa?color:'rgba(255,255,255,0.1)', position:'relative', flexShrink:0, transition:'background 0.2s', boxShadow:ass.ativa?`0 0 8px ${color}50`:'none' }}>
          <span style={{ position:'absolute', top:'3px', left:ass.ativa?'19px':'3px', width:'14px', height:'14px', borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
        </button>
        <div style={{ width:'36px', height:'36px', flexShrink:0, background:`${color}15`, border:`1px solid ${color}22`, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px' }}>
          {meta.emoji}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
            <p style={{ fontSize:'13px', fontWeight:700, color:ass.ativa?'#e2e8f0':'rgba(226,232,240,0.5)' }}>{ass.nome}</p>
            <span style={{ fontSize:'9px', background:`${color}15`, color, padding:'1px 5px', borderRadius:'4px', fontWeight:600 }}>{ass.categoria}</span>
          </div>
          <div style={{ display:'flex', gap:'6px', marginTop:'2px' }}>
            {ass.vencimento?<p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>Dia {ass.vencimento}</p>:null}
            {ass.observacao?<p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>· {ass.observacao}</p>:null}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <p style={{ fontSize:'14px', fontWeight:800, color:ass.ativa?color:'rgba(226,232,240,0.4)', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(ass.valor)}</p>
          <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>{fmt(ass.valor*12)}/ano</p>
          <div style={{ display:'flex', gap:'4px', marginTop:'4px', justifyContent:'flex-end' }}>
            <button onClick={()=>{setLocal({...ass});setEditing(true)}} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(226,232,240,0.25)', fontSize:'12px' }}>✏️</button>
            <button onClick={()=>onRemove(ass.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,113,113,0.3)', fontSize:'12px' }}>✕</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Assinaturas() {
  const { assinaturas, addAssinatura, updateAssinatura, removeAssinatura, toggleAssinatura } = useFinancasStore()
  const [showAdd, setShowAdd] = useState(false)
  const [filtroCat, setFiltroCat] = useState('Todas')
  const [filtroAtiva, setFiltroAtiva] = useState('ativas')
  const [ordenar, setOrdenar] = useState('valor')
  const [nova, setNova] = useState({ nome:'', valor:'', categoria:'Streaming', vencimento:'', observacao:'' })

  const ativas  = assinaturas.filter(a=>a.ativa)
  const totalAtivas = ativas.reduce((a,s)=>a+s.valor,0)

  const porCategoria = useMemo(()=>{
    const g={}
    ativas.forEach(a=>{ if(!g[a.categoria]) g[a.categoria]=0; g[a.categoria]+=a.valor })
    return Object.entries(g).sort((a,b)=>b[1]-a[1])
  },[ativas])

  const categoriasFiltro = ['Todas', ...CATS.filter(c=>assinaturas.some(a=>a.categoria===c))]

  const filtered = useMemo(()=>{
    let list = assinaturas
    if (filtroAtiva==='ativas')   list=list.filter(a=>a.ativa)
    if (filtroAtiva==='inativas') list=list.filter(a=>!a.ativa)
    if (filtroCat!=='Todas')      list=list.filter(a=>a.categoria===filtroCat)
    if (ordenar==='valor')      list=[...list].sort((a,b)=>b.valor-a.valor)
    if (ordenar==='nome')       list=[...list].sort((a,b)=>a.nome.localeCompare(b.nome))
    if (ordenar==='vencimento') list=[...list].sort((a,b)=>(a.vencimento||99)-(b.vencimento||99))
    return list
  },[assinaturas,filtroAtiva,filtroCat,ordenar])

  const add = () => {
    if (!nova.nome||!nova.valor) return
    addAssinatura({ ...nova, valor:parseFloat(nova.valor), vencimento:parseInt(nova.vencimento)||0 })
    setNova({ nome:'', valor:'', categoria:'Streaming', vencimento:'', observacao:'' })
    setShowAdd(false)
  }

  return (
    <div style={{ padding:'0 0 8px' }}>
      {/* Header sem título */}
      <div style={{ background:'linear-gradient(160deg,#0d1526,#070b16)', padding:'48px 20px 20px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'radial-gradient(circle,rgba(245,158,11,0.08) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', animation:'fadeUp 0.5s ease both' }}>
          <div>
            <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Total Ativas / mês</p>
            <p style={{ fontSize:'30px', fontWeight:800, color:'#f59e0b', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em', marginTop:'4px' }}>{fmt(totalAtivas)}</p>
            <p style={{ fontSize:'12px', color:'rgba(226,232,240,0.4)', marginTop:'4px' }}>{ativas.length} ativas · {assinaturas.filter(a=>!a.ativa).length} inativas</p>
          </div>
          <button onClick={()=>setShowAdd(!showAdd)} style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'8px 14px', color:'#f59e0b', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>+ Nova</button>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Breakdown por categoria */}
        <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'18px', padding:'14px', marginBottom:'14px', animation:'fadeUp 0.5s ease 0.1s both' }}>
          <p style={{ fontSize:'12px', fontWeight:600, color:'rgba(226,232,240,0.5)', marginBottom:'10px' }}>Por categoria</p>
          <div style={{ display:'flex', height:'5px', borderRadius:'3px', overflow:'hidden', gap:'1px', marginBottom:'10px' }}>
            {porCategoria.map(([cat,val])=>(
              <div key={cat} style={{ width:`${totalAtivas>0?(val/totalAtivas)*100:0}%`, background:CAT_META[cat]?.color||'#6ee7b7' }} />
            ))}
          </div>
          {porCategoria.map(([cat,val])=>{
            const m = CAT_META[cat]||CAT_META['Outros']
            const count = ativas.filter(a=>a.categoria===cat).length
            return (
              <div key={cat} style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'7px' }}>
                <span style={{ fontSize:'12px', flexShrink:0 }}>{m.emoji}</span>
                <span style={{ fontSize:'11px', color:'rgba(226,232,240,0.6)', flex:1 }}>{cat}</span>
                <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>{count}x</span>
                <span style={{ fontSize:'11px', fontWeight:700, color:m.color, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(val)}</span>
              </div>
            )
          })}
        </div>

        {/* Controles */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'10px', flexWrap:'wrap', animation:'fadeUp 0.5s ease 0.15s both' }}>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'3px' }}>
            {[['ativas','Ativas'],['inativas','Inativas'],['todas','Todas']].map(([k,l])=>(
              <button key={k} onClick={()=>setFiltroAtiva(k)} style={{ background:filtroAtiva===k?'rgba(255,255,255,0.1)':'none', border:'none', borderRadius:'8px', padding:'5px 10px', color:filtroAtiva===k?'#e2e8f0':'rgba(226,232,240,0.4)', fontSize:'11px', fontWeight:filtroAtiva===k?600:400, cursor:'pointer' }}>{l}</button>
            ))}
          </div>
          <select value={ordenar} onChange={e=>setOrdenar(e.target.value)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'5px 10px', color:'rgba(226,232,240,0.6)', fontSize:'11px', cursor:'pointer' }}>
            <option value="valor">↓ Valor</option>
            <option value="nome">A-Z Nome</option>
            <option value="vencimento">Vencimento</option>
          </select>
        </div>

        {/* Filtro categoria */}
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'6px', marginBottom:'12px', animation:'fadeUp 0.5s ease 0.18s both' }}>
          {categoriasFiltro.map(c=>{
            const m = CAT_META[c]
            const active = filtroCat===c
            return (
              <button key={c} onClick={()=>setFiltroCat(c)} style={{ background:active?`${m?.color||'#6ee7b7'}18`:'rgba(255,255,255,0.03)', border:`1px solid ${active?(m?.color||'#6ee7b7'):'rgba(255,255,255,0.07)'}`, borderRadius:'20px', padding:'5px 10px', color:active?(m?.color||'#6ee7b7'):'rgba(226,232,240,0.4)', fontSize:'11px', cursor:'pointer', whiteSpace:'nowrap' }}>
                {m?`${m.emoji} `:''}{c}
              </button>
            )
          })}
        </div>

        {/* Form nova */}
        {showAdd && (
          <div style={{ background:'#111827', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'16px', padding:'16px', marginBottom:'12px', animation:'scaleIn 0.2s ease both' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'#f59e0b', marginBottom:'12px' }}>Nova Assinatura</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {[{label:'Nome',key:'nome',type:'text'},{label:'Valor/mês (R$)',key:'valor',type:'number'},{label:'Dia vencimento',key:'vencimento',type:'number'},{label:'Observação',key:'observacao',type:'text'}].map(f=>(
                  <div key={f.key}>
                    <label style={{ fontSize:'10px', color:'rgba(226,232,240,0.4)', display:'block', marginBottom:'3px' }}>{f.label}</label>
                    <input type={f.type} value={nova[f.key]} onChange={e=>setNova({...nova,[f.key]:e.target.value})}
                      style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 10px', color:'#e2e8f0', fontSize:'12px' }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize:'10px', color:'rgba(226,232,240,0.4)', display:'block', marginBottom:'3px' }}>Categoria</label>
                <select value={nova.categoria} onChange={e=>setNova({...nova,categoria:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                  {CATS.map(c=><option key={c} value={c}>{CAT_META[c].emoji} {c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={add} style={{ flex:1, background:'rgba(245,158,11,0.18)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'10px', padding:'10px', color:'#f59e0b', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Adicionar</button>
                <button onClick={()=>setShowAdd(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {filtered.map((ass,i)=>(
          <div key={ass.id} style={{ animation:`fadeUp 0.4s ease ${i*0.02}s both` }}>
            <AssCard ass={ass} onUpdate={updateAssinatura} onRemove={removeAssinatura} onToggle={toggleAssinatura} />
          </div>
        ))}
        {filtered.length===0 && <p style={{ textAlign:'center', color:'rgba(226,232,240,0.3)', fontSize:'13px', padding:'32px 0' }}>Nenhuma assinatura encontrada</p>}
      </div>
    </div>
  )
}
