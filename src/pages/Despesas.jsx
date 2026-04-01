import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import useFinancasStore from '../store'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(v||0)
const fmtD = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v||0)

function ItemRow({ item, catId, catCor, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({ nome:item.nome, valor:item.valor, observacao:item.observacao||'' })
  const save = () => { onUpdate(catId, item.id, { nome:local.nome, valor:parseFloat(local.valor)||0, observacao:local.observacao }); setEditing(false) }

  if (item.readonly) return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize:'13px', color:'rgba(226,232,240,0.45)', fontStyle:'italic' }}>📋 {item.nome}</span>
      <span style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b', fontFamily:"'JetBrains Mono',monospace" }}>{fmtD(item.valor)}</span>
    </div>
  )

  if (editing) return (
    <div style={{ padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display:'flex', gap:'6px', marginBottom:'6px' }}>
        <input value={local.nome} onChange={e=>setLocal({...local,nome:e.target.value})} style={{ flex:2, background:'rgba(255,255,255,0.06)', border:`1px solid ${catCor}30`, borderRadius:'7px', padding:'6px 8px', color:'#e2e8f0', fontSize:'12px' }} />
        <input type="number" value={local.valor} onChange={e=>setLocal({...local,valor:e.target.value})} style={{ flex:1, background:'rgba(255,255,255,0.06)', border:`1px solid ${catCor}30`, borderRadius:'7px', padding:'6px 8px', color:'#e2e8f0', fontSize:'12px', fontFamily:"'JetBrains Mono',monospace" }} />
      </div>
      <input value={local.observacao} onChange={e=>setLocal({...local,observacao:e.target.value})} placeholder="Observação" style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'7px', padding:'5px 8px', color:'#e2e8f0', fontSize:'11px', marginBottom:'6px' }} />
      <div style={{ display:'flex', gap:'6px' }}>
        <button onClick={save} style={{ flex:1, background:`${catCor}22`, border:`1px solid ${catCor}35`, borderRadius:'7px', padding:'6px', color:catCor, cursor:'pointer', fontSize:'12px', fontWeight:700 }}>✓ Salvar</button>
        <button onClick={()=>setEditing(false)} style={{ background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'7px', padding:'6px 10px', color:'rgba(226,232,240,0.5)', cursor:'pointer', fontSize:'12px' }}>✕</button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ flex:1 }}>
        <span style={{ fontSize:'13px', color:'rgba(226,232,240,0.7)', display:'block' }}>{item.nome}</span>
        {item.observacao && <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>{item.observacao}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0, marginLeft:'8px' }}>
        <span style={{ fontSize:'13px', fontWeight:700, color:'#e2e8f0', fontFamily:"'JetBrains Mono',monospace" }}>{fmtD(item.valor)}</span>
        <button onClick={()=>{setLocal({nome:item.nome,valor:item.valor,observacao:item.observacao||''});setEditing(true)}} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(226,232,240,0.25)', fontSize:'12px', padding:'2px' }}>✏️</button>
        <button onClick={()=>onRemove(catId,item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,113,113,0.35)', fontSize:'12px', padding:'2px' }}>✕</button>
      </div>
    </div>
  )
}

function CategoriaCard({ cat, index, onAddItem, onUpdateItem, onRemoveItem }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(index < 2)
  const [addingItem, setAddingItem] = useState(false)
  const [novoItem, setNovoItem] = useState({ nome:'', valor:'', observacao:'' })
  const total = cat.itens.reduce((a,i)=>a+i.valor,0)
  const addItem = () => {
    if (!novoItem.nome||!novoItem.valor) return
    onAddItem(cat.id, { nome:novoItem.nome, valor:parseFloat(novoItem.valor)||0, observacao:novoItem.observacao })
    setNovoItem({ nome:'', valor:'', observacao:'' }); setAddingItem(false)
  }

  return (
    <div style={{ background:'linear-gradient(135deg,#111827,#0d1422)', border:`1px solid ${cat.cor}20`, borderRadius:'18px', overflow:'hidden', marginBottom:'10px', animation:`fadeUp 0.5s ease ${0.1+index*0.05}s both` }}>
      <button onClick={()=>setOpen(!open)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', textAlign:'left' }}>
          <span style={{ width:'36px', height:'36px', background:`${cat.cor}18`, border:`1px solid ${cat.cor}28`, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>{cat.icone}</span>
          <div>
            <p style={{ fontSize:'14px', fontWeight:700, color:'#e2e8f0' }}>{cat.nome}</p>
            <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', marginTop:'1px' }}>{cat.itens.length} itens · {open?'▲':'▼'}</p>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:'15px', fontWeight:800, color:cat.cor, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(total)}</p>
          <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>{fmt(total*12)}/ano</p>
        </div>
      </button>
      {open && (
        <div style={{ padding:'0 18px 14px', borderTop:'1px solid rgba(255,255,255,0.04)', animation:'scaleIn 0.2s ease both' }}>
          <div style={{ paddingTop:'6px' }}>
            {cat.itens.map(item=><ItemRow key={item.id} item={item} catId={cat.id} catCor={cat.cor} onUpdate={onUpdateItem} onRemove={onRemoveItem} />)}
          </div>
          {cat.nome==='Variáveis' && (
            <button onClick={()=>navigate('/assinaturas')} style={{ display:'block', fontSize:'11px', color:'#f59e0b', background:'rgba(245,158,11,0.06)', border:'1px dashed rgba(245,158,11,0.2)', borderRadius:'7px', padding:'6px 10px', cursor:'pointer', margin:'6px 0', width:'100%', textAlign:'left' }}>
              📋 Gerenciar assinaturas →
            </button>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid rgba(255,255,255,0.05)', marginTop:'4px' }}>
            <span style={{ fontSize:'12px', fontWeight:700, color:'rgba(226,232,240,0.6)' }}>Subtotal</span>
            <span style={{ fontSize:'14px', fontWeight:800, color:cat.cor, fontFamily:"'JetBrains Mono',monospace" }}>{fmtD(total)}</span>
          </div>
          {addingItem ? (
            <div>
              <div style={{ display:'flex', gap:'6px', marginBottom:'6px' }}>
                <input autoFocus value={novoItem.nome} onChange={e=>setNovoItem({...novoItem,nome:e.target.value})} placeholder="Nome"
                  style={{ flex:2, background:'rgba(255,255,255,0.06)', border:`1px solid ${cat.cor}30`, borderRadius:'8px', padding:'7px 10px', color:'#e2e8f0', fontSize:'12px' }} />
                <input type="number" value={novoItem.valor} onChange={e=>setNovoItem({...novoItem,valor:e.target.value})} placeholder="R$"
                  style={{ flex:1, background:'rgba(255,255,255,0.06)', border:`1px solid ${cat.cor}30`, borderRadius:'8px', padding:'7px 10px', color:'#e2e8f0', fontSize:'12px' }} />
              </div>
              <div style={{ display:'flex', gap:'6px' }}>
                <button onClick={addItem} style={{ flex:1, background:`${cat.cor}20`, border:`1px solid ${cat.cor}35`, borderRadius:'8px', padding:'8px', color:cat.cor, cursor:'pointer', fontSize:'12px', fontWeight:700 }}>+ Adicionar</button>
                <button onClick={()=>setAddingItem(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'8px', padding:'8px', color:'rgba(226,232,240,0.5)', cursor:'pointer', fontSize:'12px' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setAddingItem(true)} style={{ width:'100%', background:`${cat.cor}07`, border:`1px dashed ${cat.cor}22`, borderRadius:'8px', padding:'7px', color:cat.cor, fontSize:'12px', cursor:'pointer' }}>+ Adicionar item</button>
          )}
        </div>
      )}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active||!payload?.length) return null
  const d = payload[0]
  return (
    <div style={{ background:'rgba(7,11,22,0.97)', border:`1px solid ${d.payload.cor}40`, borderRadius:'10px', padding:'10px 14px' }}>
      <p style={{ fontSize:'13px', fontWeight:700, color:d.payload.cor }}>{d.payload.icone} {d.name}</p>
      <p style={{ fontSize:'14px', fontWeight:800, color:'#e2e8f0', fontFamily:"'JetBrains Mono',monospace", marginTop:'3px' }}>{fmt(d.value)}</p>
      <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', marginTop:'2px' }}>{d.payload.pct}% do total</p>
    </div>
  )
}

export default function Despesas() {
  const { categoriasDespesas, addItemDespesa, updateItemDespesa, removeItemDespesa } = useFinancasStore()
  const totalMensal = categoriasDespesas.reduce((a,c)=>a+c.itens.reduce((b,i)=>b+i.valor,0),0)

  const pieData = categoriasDespesas.map(c=>{
    const valor = c.itens.reduce((a,i)=>a+i.valor,0)
    return { name:c.nome, value:valor, cor:c.cor, icone:c.icone, pct: totalMensal>0?((valor/totalMensal)*100).toFixed(1):0 }
  }).sort((a,b)=>b.value-a.value)

  return (
    <div style={{ padding:'0 0 8px' }}>
      {/* Header sem título */}
      <div style={{ background:'linear-gradient(160deg,#0d1526,#070b16)', padding:'48px 20px 20px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'radial-gradient(circle,rgba(248,113,113,0.07) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ animation:'fadeUp 0.5s ease both' }}>
          <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Total Mensal</p>
          <p style={{ fontSize:'30px', fontWeight:800, color:'#f87171', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em', marginTop:'4px' }}>{fmt(totalMensal)}</p>
          <p style={{ fontSize:'12px', color:'rgba(226,232,240,0.4)', marginTop:'4px' }}>{fmt(totalMensal*12)}/ano</p>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Pizza */}
        <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'18px', padding:'16px', marginBottom:'14px', animation:'fadeUp 0.5s ease 0.1s both' }}>
          <p style={{ fontSize:'12px', fontWeight:600, color:'rgba(226,232,240,0.6)', marginBottom:'10px' }}>Distribuição por categoria</p>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx={65} cy={65} innerRadius={36} outerRadius={62} dataKey="value" paddingAngle={2}>
                  {pieData.map((e,i)=><Cell key={i} fill={e.cor} stroke="transparent"/>)}
                </Pie>
                <Tooltip content={<PieTooltip />}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'7px' }}>
              {pieData.map(d=>(
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:d.cor, flexShrink:0 }} />
                  <span style={{ fontSize:'11px', color:'rgba(226,232,240,0.6)', flex:1 }}>{d.icone} {d.name}</span>
                  <span style={{ fontSize:'11px', fontWeight:700, color:d.cor, fontFamily:"'JetBrains Mono',monospace" }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categorias */}
        {categoriasDespesas.map((cat,i)=>(
          <CategoriaCard key={cat.id} cat={cat} index={i} onAddItem={addItemDespesa} onUpdateItem={updateItemDespesa} onRemoveItem={removeItemDespesa} />
        ))}
      </div>
    </div>
  )
}
