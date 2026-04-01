import { useState } from 'react'
import useFinancasStore from '../store'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(v||0)
const fmtD = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v||0)

const TIPOS_BEM = [
  { key:'imovel',    label:'Imóvel',       emoji:'🏠', color:'#6ee7b7' },
  { key:'veiculo',   label:'Veículo',      emoji:'🚗', color:'#60a5fa' },
  { key:'empresa',   label:'Empresa',      emoji:'🏢', color:'#818cf8' },
  { key:'terreno',   label:'Terreno',      emoji:'🌎', color:'#34d399' },
  { key:'arte',      label:'Arte/Coleção', emoji:'🎨', color:'#f472b6' },
  { key:'outros',    label:'Outros',       emoji:'📦', color:'#94a3b8' },
]

function BemCard({ bem, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal]     = useState({ ...bem })
  const tipo = TIPOS_BEM.find(t=>t.key===bem.tipo) || TIPOS_BEM[5]

  const save = () => {
    onUpdate(bem.id, { ...local, valor:parseFloat(local.valor)||0, valorCompra:parseFloat(local.valorCompra)||0 })
    setEditing(false)
  }

  const valorizacao = bem.valorCompra > 0 ? ((bem.valor - bem.valorCompra) / bem.valorCompra) * 100 : null

  if (editing) return (
    <div style={{ background:'#111827', border:`1px solid ${tipo.color}25`, borderRadius:'16px', padding:'16px', marginBottom:'10px' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        <div>
          <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Tipo</label>
          <select value={local.tipo} onChange={e=>setLocal({...local,tipo:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
            {TIPOS_BEM.map(t=><option key={t.key} value={t.key}>{t.emoji} {t.label}</option>)}
          </select>
        </div>
        {[
          {label:'Nome / Descrição', key:'nome', type:'text'},
          {label:'Valor Atual (R$)', key:'valor', type:'number'},
          {label:'Valor de Compra (R$)', key:'valorCompra', type:'number'},
          {label:'Observação', key:'observacao', type:'text'},
        ].map(f=>(
          <div key={f.key}>
            <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>{f.label}</label>
            <input type={f.type} value={local[f.key]||''} onChange={e=>setLocal({...local,[f.key]:e.target.value})}
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
          </div>
        ))}
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={save} style={{ flex:1, background:`${tipo.color}20`, border:`1px solid ${tipo.color}35`, borderRadius:'10px', padding:'10px', color:tipo.color, fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Salvar</button>
          <button onClick={()=>setEditing(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background:'linear-gradient(135deg,#111827,#0d1422)', border:`1px solid ${tipo.color}20`, borderRadius:'16px', padding:'14px 18px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px' }}>
      <div style={{ width:'42px', height:'42px', background:`${tipo.color}18`, border:`1px solid ${tipo.color}28`, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
        {tipo.emoji}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'14px', fontWeight:700, color:'#e2e8f0' }}>{bem.nome}</p>
        <div style={{ display:'flex', gap:'8px', marginTop:'3px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:'10px', color:tipo.color }}>{tipo.label}</span>
          {valorizacao !== null && (
            <span style={{ fontSize:'10px', color: valorizacao >= 0 ? '#6ee7b7' : '#f87171', fontWeight:600 }}>
              {valorizacao >= 0 ? '▲' : '▼'} {Math.abs(valorizacao).toFixed(1)}%
            </span>
          )}
          {bem.observacao && <span style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>{bem.observacao}</span>}
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <p style={{ fontSize:'16px', fontWeight:800, color:tipo.color, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(bem.valor)}</p>
        {bem.valorCompra > 0 && <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>Compra: {fmt(bem.valorCompra)}</p>}
        <div style={{ display:'flex', gap:'4px', marginTop:'4px', justifyContent:'flex-end' }}>
          <button onClick={()=>{setLocal({...bem});setEditing(true)}} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(226,232,240,0.25)', fontSize:'12px' }}>✏️</button>
          <button onClick={()=>onRemove(bem.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,113,113,0.3)', fontSize:'12px' }}>✕</button>
        </div>
      </div>
    </div>
  )
}

export default function Patrimonio() {
  const { investimentos, financiamentos, bens, addBem, updateBem, removeBem } = useFinancasStore()
  const [showAdd, setShowAdd] = useState(false)
  const [novo, setNovo] = useState({ nome:'', tipo:'imovel', valor:'', valorCompra:'', observacao:'' })

  const totalInvest  = investimentos.reduce((a,i)=>a+i.valor, 0)
  const totalDividas = financiamentos.reduce((a,f)=>a+f.saldoDevedor, 0)
  const totalBens    = (bens||[]).reduce((a,b)=>a+b.valor, 0)
  const patrimonioLiq = totalBens + totalInvest - totalDividas

  const addBemNovo = () => {
    if (!novo.nome || !novo.valor) return
    addBem({ ...novo, valor:parseFloat(novo.valor)||0, valorCompra:parseFloat(novo.valorCompra)||0 })
    setNovo({ nome:'', tipo:'imovel', valor:'', valorCompra:'', observacao:'' })
    setShowAdd(false)
  }

  const tipoColor = patrimonioLiq >= 0 ? '#6ee7b7' : '#f87171'

  return (
    <div style={{ padding:'0 0 8px' }}>
      {/* Header — patrimônio líquido em destaque */}
      <div style={{ background:'linear-gradient(160deg,#0d1526,#070b16)', padding:'48px 20px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'220px', height:'220px', background:`radial-gradient(circle,${tipoColor}08 0%,transparent 70%)`, borderRadius:'50%' }} />
        <div style={{ animation:'fadeUp 0.5s ease both' }}>
          <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Patrimônio Líquido</p>
          <p style={{ fontSize:'36px', fontWeight:800, color:tipoColor, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.03em', marginTop:'6px', lineHeight:1 }}>
            {fmt(patrimonioLiq)}
          </p>
        </div>

        {/* Resumo das 3 parcelas */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:'18px', animation:'fadeUp 0.5s ease 0.1s both' }}>
          {[
            { label:'Bens', value:totalBens, color:'#6ee7b7', sign:'' },
            { label:'Investimentos', value:totalInvest, color:'#818cf8', sign:'' },
            { label:'Financiamentos', value:totalDividas, color:'#f87171', sign:'−' },
          ].map(s=>(
            <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'10px 8px', textAlign:'center' }}>
              <p style={{ fontSize:'13px', fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.sign}{fmt(s.value)}</p>
              <p style={{ fontSize:'9px', color:'rgba(226,232,240,0.35)', marginTop:'3px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* Bens cadastrados */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', animation:'fadeUp 0.5s ease 0.15s both' }}>
          <div>
            <p style={{ fontSize:'14px', fontWeight:600, color:'rgba(226,232,240,0.8)' }}>Bens</p>
            <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.35)', marginTop:'2px' }}>Total: {fmt(totalBens)}</p>
          </div>
          <button onClick={()=>setShowAdd(!showAdd)} style={{ background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'12px', padding:'8px 14px', color:'#6ee7b7', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>+ Adicionar</button>
        </div>

        {/* Form novo bem */}
        {showAdd && (
          <div style={{ background:'#111827', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'16px', padding:'16px', marginBottom:'12px', animation:'scaleIn 0.2s ease both' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'#6ee7b7', marginBottom:'12px' }}>Novo Bem</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Tipo</label>
                <select value={novo.tipo} onChange={e=>setNovo({...novo,tipo:e.target.value})} style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                  {TIPOS_BEM.map(t=><option key={t.key} value={t.key}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
              {[
                {label:'Nome / Descrição', key:'nome', type:'text'},
                {label:'Valor Atual (R$)', key:'valor', type:'number'},
                {label:'Valor de Compra (R$)', key:'valorCompra', type:'number'},
                {label:'Observação', key:'observacao', type:'text'},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>{f.label}</label>
                  <input type={f.type} value={novo[f.key]} onChange={e=>setNovo({...novo,[f.key]:e.target.value})}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
                </div>
              ))}
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={addBemNovo} style={{ flex:1, background:'linear-gradient(135deg,#6ee7b7,#3b82f6)', border:'none', borderRadius:'10px', padding:'10px', color:'#070b16', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Adicionar</button>
                <button onClick={()=>setShowAdd(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de bens */}
        {(bens||[]).length === 0 && !showAdd && (
          <div style={{ textAlign:'center', padding:'32px 20px', color:'rgba(226,232,240,0.3)', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px dashed rgba(255,255,255,0.08)', marginBottom:'16px' }}>
            <p style={{ fontSize:'28px', marginBottom:'8px' }}>🏠</p>
            <p style={{ fontSize:'13px', marginBottom:'4px' }}>Nenhum bem cadastrado</p>
            <p style={{ fontSize:'11px' }}>Imóveis, veículos, arte, etc.</p>
          </div>
        )}
        {(bens||[]).map((b,i)=>(
          <div key={b.id} style={{ animation:`fadeUp 0.4s ease ${i*0.05}s both` }}>
            <BemCard bem={b} onUpdate={updateBem} onRemove={removeBem} />
          </div>
        ))}

        {/* Investimentos (readonly, link) */}
        <div style={{ background:'linear-gradient(135deg,#111827,#0d1422)', border:'1px solid rgba(129,140,248,0.2)', borderRadius:'16px', padding:'14px 18px', marginBottom:'10px', animation:'fadeUp 0.5s ease 0.2s both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'38px', height:'38px', background:'rgba(129,140,248,0.15)', border:'1px solid rgba(129,140,248,0.25)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>📊</div>
              <div>
                <p style={{ fontSize:'14px', fontWeight:700, color:'#e2e8f0' }}>Investimentos</p>
                <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.35)', marginTop:'2px' }}>{investimentos.length} ativos · via aba Invest.</p>
              </div>
            </div>
            <p style={{ fontSize:'16px', fontWeight:800, color:'#818cf8', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(totalInvest)}</p>
          </div>
        </div>

        {/* Financiamentos (readonly, negativo) */}
        <div style={{ background:'linear-gradient(135deg,#111827,#0d1422)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'16px', padding:'14px 18px', marginBottom:'16px', animation:'fadeUp 0.5s ease 0.25s both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'38px', height:'38px', background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.22)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🏦</div>
              <div>
                <p style={{ fontSize:'14px', fontWeight:700, color:'#e2e8f0' }}>Financiamentos</p>
                <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.35)', marginTop:'2px' }}>{financiamentos.length} contratos · via aba Financ.</p>
              </div>
            </div>
            <p style={{ fontSize:'16px', fontWeight:800, color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>−{fmt(totalDividas)}</p>
          </div>
        </div>

        {/* Linha de resultado */}
        <div style={{
          background:`linear-gradient(135deg,${tipoColor}12,${tipoColor}04)`,
          border:`1px solid ${tipoColor}25`, borderRadius:'18px', padding:'18px',
          animation:'fadeUp 0.5s ease 0.3s both',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
            <p style={{ fontSize:'14px', fontWeight:700, color:'rgba(226,232,240,0.8)' }}>Patrimônio Líquido</p>
            <p style={{ fontSize:'24px', fontWeight:800, color:tipoColor, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em' }}>{fmt(patrimonioLiq)}</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {[
              { label:'+ Bens', value:totalBens, color:'#6ee7b7' },
              { label:'+ Investimentos', value:totalInvest, color:'#818cf8' },
              { label:'− Financiamentos', value:totalDividas, color:'#f87171' },
            ].map(s=>(
              <div key={s.label} style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:'12px', color:'rgba(226,232,240,0.45)' }}>{s.label}</span>
                <span style={{ fontSize:'12px', fontWeight:600, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
