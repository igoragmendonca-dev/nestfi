import { useState } from 'react'
import useFinancasStore from '../store'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v||0)
const fmtK = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(v||0)

function calcSalario(sal) {
  const brutos = ['salarioBasico','rmnr','anuenio','gratFuncaoGer','heDesembarque','auxilioEducacional']
  const totalBruto = brutos.reduce((a,k)=>a+(sal[k]||0),0)
  const petros = totalBruto * 0.09
  const ir = Math.max(0, (totalBruto - (sal.inss||0) - petros) * 0.275 - 908.73)
  const totalDesc = (sal.inss||0) + (sal.ams||0) + petros + ir
  return { totalBruto, petros, ir, totalDesc, liquido: totalBruto - totalDesc }
}

const CAMPOS_BRUTO = [
  { key:'salarioBasico',      label:'Salário Básico' },
  { key:'rmnr',               label:'RMNR' },
  { key:'anuenio',            label:'Anuênio' },
  { key:'gratFuncaoGer',      label:'Grat. Função Ger.' },
  { key:'heDesembarque',      label:'HE Desembarque' },
  { key:'auxilioEducacional', label:'Auxílio Educacional' },
]
const CAMPOS_DESC_MANUAL = [
  { key:'inss', label:'INSS' },
  { key:'ams',  label:'AMS' },
]

function CampoEditavel({ label, value, color, onChange }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState('')
  const start = () => { setLocal(String(value)); setEditing(true) }
  const confirm = () => { onChange(local); setEditing(false) }
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize:'13px', color:'rgba(226,232,240,0.55)' }}>{label}</span>
      {editing ? (
        <input autoFocus type="number" value={local}
          onChange={e=>setLocal(e.target.value)}
          onBlur={confirm}
          onKeyDown={e=>{ if(e.key==='Enter') confirm(); if(e.key==='Escape') setEditing(false) }}
          style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${color}50`, borderRadius:'8px', padding:'4px 8px', color:'#e2e8f0', fontSize:'13px', width:'130px', textAlign:'right', fontFamily:"'JetBrains Mono',monospace" }}
        />
      ) : (
        <button onClick={start} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:600, color, fontFamily:"'JetBrains Mono',monospace", padding:'3px 7px', borderRadius:'6px' }}>
          {fmt(parseFloat(value)||0)}
        </button>
      )}
    </div>
  )
}

function SalarioDetalhe({ sal, onUpdate }) {
  const { totalBruto, petros, ir, totalDesc, liquido } = calcSalario(sal)
  return (
    <div style={{ paddingTop:'12px' }}>
      <p style={{ fontSize:'10px', color:'#6ee7b7', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom:'4px' }}>▸ Proventos Brutos</p>
      {CAMPOS_BRUTO.map(c => (
        <CampoEditavel key={c.key} label={c.label} value={sal[c.key]||0} color="#6ee7b7" onChange={v=>onUpdate(c.key, v)} />
      ))}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0' }}>
        <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(226,232,240,0.7)' }}>Total Bruto</span>
        <span style={{ fontSize:'14px', fontWeight:800, color:'#6ee7b7', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(totalBruto)}</span>
      </div>

      <p style={{ fontSize:'10px', color:'#f87171', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom:'4px', marginTop:'8px' }}>▸ Descontos Manuais</p>
      {CAMPOS_DESC_MANUAL.map(c => (
        <CampoEditavel key={c.key} label={c.label} value={sal[c.key]||0} color="#f87171" onChange={v=>onUpdate(c.key, v)} />
      ))}

      <div style={{ marginTop:'10px', background:'rgba(248,113,113,0.05)', border:'1px solid rgba(248,113,113,0.12)', borderRadius:'10px', padding:'10px 12px' }}>
        <p style={{ fontSize:'10px', color:'#f87171', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom:'6px' }}>▸ Descontos Automáticos</p>
        {[
          { label:'Petros (9% do bruto)', value:petros, info:'Bruto × 9%' },
          { label:'IR (27,5% − R$908,73)', value:ir, info:'(Bruto − INSS − Petros) × 27,5% − 908,73' },
        ].map(d => (
          <div key={d.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <span style={{ fontSize:'12px', color:'rgba(226,232,240,0.5)' }}>{d.label}</span>
              <p style={{ fontSize:'9px', color:'rgba(226,232,240,0.25)' }}>{d.info}</p>
            </div>
            <span style={{ fontSize:'12px', fontWeight:600, color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(d.value)}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'7px' }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'rgba(226,232,240,0.5)' }}>Total Descontos</span>
          <span style={{ fontSize:'13px', fontWeight:800, color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(totalDesc)}</span>
        </div>
      </div>

      <div style={{ marginTop:'12px', background:'linear-gradient(135deg,rgba(110,231,183,0.1),rgba(59,130,246,0.06))', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'12px', padding:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontSize:'13px', fontWeight:700, color:'#e2e8f0' }}>Líquido</p>
          <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.4)', marginTop:'2px' }}>{((totalDesc/totalBruto)*100).toFixed(1)}% descontado</p>
        </div>
        <p style={{ fontSize:'22px', fontWeight:800, color:'#6ee7b7', fontFamily:"'JetBrains Mono',monospace" }}>{fmt(liquido)}</p>
      </div>
    </div>
  )
}

// Card genérico para qualquer fonte de renda
function RendaCard({ renda, onUpdate, onRemove, onAddDespesa, onRemoveDespesa }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({ ...renda })
  const [addingDesp, setAddingDesp] = useState(false)
  const [novaDesp, setNovaDesp] = useState({ nome:'', valor:'' })

  const isSal = renda.tipo === 'salario'
  const sal   = renda.salario || {}

  const { liquido: salLiq, totalBruto } = isSal ? calcSalario(sal) : {}
  const totalDesp = !isSal ? (renda.despesas||[]).reduce((a,d)=>a+d.valor,0) : 0
  const liquido   = isSal ? salLiq : renda.valor - totalDesp

  const catColors = { Aluguel:'#6ee7b7', Investimentos:'#818cf8', Freelance:'#fbbf24', Dividendos:'#34d399', Salário:'#60a5fa', Outros:'#94a3b8' }
  const cor = catColors[renda.categoria] || '#6ee7b7'

  const updateSalCampo = (campo, valor) => {
    onUpdate(renda.id, { salario: { ...sal, [campo]: parseFloat(valor)||0 } })
  }

  const save = () => {
    onUpdate(renda.id, { ...local, valor: parseFloat(local.valor)||0 })
    setEditing(false)
  }

  return (
    <div style={{ background:'linear-gradient(135deg,#111827,#0d1422)', border:`1px solid ${cor}20`, borderRadius:'18px', overflow:'hidden', marginBottom:'10px', boxShadow:'0 2px 12px rgba(0,0,0,0.2)' }}>
      {/* Header */}
      <button onClick={()=>setOpen(!open)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', textAlign:'left' }}>
          <div style={{ width:'38px', height:'38px', background:`${cor}18`, border:`1px solid ${cor}25`, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
            {isSal ? '💼' : '💵'}
          </div>
          <div>
            <div style={{ display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap' }}>
              <p style={{ fontSize:'14px', fontWeight:700, color:'#e2e8f0' }}>{renda.nome}</p>
              <span style={{ fontSize:'9px', background:`${cor}18`, color:cor, padding:'1px 6px', borderRadius:'4px', fontWeight:600 }}>{renda.categoria}</span>
            </div>
            {renda.descricao && <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.35)', marginTop:'2px' }}>{renda.descricao}</p>}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <p style={{ fontSize:'15px', fontWeight:800, color:cor, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(liquido)}</p>
          {isSal && <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.3)' }}>Bruto {fmt(totalBruto)}</p>}
          {!isSal && totalDesp>0 && <p style={{ fontSize:'10px', color:'#f87171' }}>−{fmt(totalDesp)}</p>}
          <p style={{ fontSize:'10px', color:'rgba(226,232,240,0.25)' }}>{open?'▲':'▼'}</p>
        </div>
      </button>

      {/* Detalhe */}
      {open && (
        <div style={{ padding:'0 18px 16px', borderTop:'1px solid rgba(255,255,255,0.05)', animation:'scaleIn 0.2s ease both' }}>
          {isSal ? (
            // Salário — campos editáveis inline
            <SalarioDetalhe sal={sal} onUpdate={updateSalCampo} />
          ) : editing ? (
            // Edição simples
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', paddingTop:'14px' }}>
              {[{label:'Nome',key:'nome',type:'text'},{label:'Valor Bruto (R$)',key:'valor',type:'number'},{label:'Descrição',key:'descricao',type:'text'}].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>{f.label}</label>
                  <input type={f.type} value={local[f.key]||''} onChange={e=>setLocal({...local,[f.key]:e.target.value})}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Categoria</label>
                <select value={local.categoria} onChange={e=>setLocal({...local,categoria:e.target.value})}
                  style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                  {['Aluguel','Investimentos','Freelance','Dividendos','Outros'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={save} style={{ flex:1, background:`${cor}20`, border:`1px solid ${cor}35`, borderRadius:'10px', padding:'10px', color:cor, fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Salvar</button>
                <button onClick={()=>setEditing(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            // Visualização simples
            <div style={{ paddingTop:'12px' }}>
              {(renda.despesas||[]).map(d=>(
                <div key={d.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize:'12px', color:'rgba(226,232,240,0.5)' }}>{d.nome}</span>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span style={{ fontSize:'12px', color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>−{fmt(d.valor)}</span>
                    <button onClick={()=>onRemoveDespesa(renda.id,d.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,113,113,0.4)', fontSize:'12px' }}>✕</button>
                  </div>
                </div>
              ))}
              {addingDesp ? (
                <div style={{ display:'flex', gap:'6px', margin:'8px 0', alignItems:'center' }}>
                  <input placeholder="Dedução" value={novaDesp.nome} onChange={e=>setNovaDesp({...novaDesp,nome:e.target.value})}
                    style={{ flex:2, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'7px 10px', color:'#e2e8f0', fontSize:'12px' }} />
                  <input type="number" placeholder="R$" value={novaDesp.valor} onChange={e=>setNovaDesp({...novaDesp,valor:e.target.value})}
                    style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'7px 10px', color:'#e2e8f0', fontSize:'12px' }} />
                  <button onClick={()=>{if(novaDesp.nome&&novaDesp.valor){onAddDespesa(renda.id,{nome:novaDesp.nome,valor:parseFloat(novaDesp.valor)});setNovaDesp({nome:'',valor:''});setAddingDesp(false)}}}
                    style={{ background:`${cor}20`, border:`1px solid ${cor}35`, borderRadius:'8px', padding:'7px 10px', color:cor, cursor:'pointer', fontWeight:700 }}>+</button>
                  <button onClick={()=>setAddingDesp(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(226,232,240,0.4)', fontSize:'14px' }}>✕</button>
                </div>
              ) : (
                <button onClick={()=>setAddingDesp(true)} style={{ width:'100%', background:`${cor}07`, border:`1px dashed ${cor}22`, borderRadius:'8px', padding:'7px', color:cor, fontSize:'11px', cursor:'pointer', margin:'8px 0' }}>
                  + Adicionar dedução
                </button>
              )}
              <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                <button onClick={()=>{setLocal({...renda});setEditing(true)}} style={{ flex:1, background:`${cor}12`, border:`1px solid ${cor}20`, borderRadius:'10px', padding:'8px', color:cor, cursor:'pointer', fontSize:'12px' }}>✏️ Editar</button>
                <button onClick={()=>onRemove(renda.id)} style={{ flex:1, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:'10px', padding:'8px', color:'#f87171', cursor:'pointer', fontSize:'12px' }}>🗑️ Remover</button>
              </div>
            </div>
          )}
          {isSal && (
            <button onClick={()=>onRemove(renda.id)} style={{ width:'100%', background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:'10px', padding:'8px', color:'#f87171', cursor:'pointer', fontSize:'12px', marginTop:'12px' }}>🗑️ Remover</button>
          )}
        </div>
      )}
    </div>
  )
}

export default function Proventos() {
  const { outrasRendas, addOutraRenda, updateOutraRenda, removeOutraRenda, addDespesaRenda, removeDespesaRenda } = useFinancasStore()
  const [showAdd, setShowAdd] = useState(false)
  const [novoTipo, setNovoTipo] = useState('simples')
  const [nova, setNova] = useState({ nome:'', valor:'', descricao:'', categoria:'Freelance' })

  const totalLiq = outrasRendas.reduce((a,r) => {
    if (r.tipo==='salario') { const {liquido}=calcSalario(r.salario||{}); return a+liquido }
    return a + r.valor - (r.despesas||[]).reduce((b,d)=>b+d.valor,0)
  }, 0)

  const addRenda = () => {
    if (!nova.nome) return
    if (novoTipo==='salario') {
      addOutraRenda({ nome:nova.nome, tipo:'salario', descricao:nova.descricao, categoria:'Salário',
        salario:{ salarioBasico:0, rmnr:0, anuenio:0, gratFuncaoGer:0, heDesembarque:0, auxilioEducacional:0, inss:0, ams:0 } })
    } else {
      if (!nova.valor) return
      addOutraRenda({ ...nova, tipo:'simples', valor:parseFloat(nova.valor) })
    }
    setNova({ nome:'', valor:'', descricao:'', categoria:'Freelance' })
    setShowAdd(false)
  }

  return (
    <div style={{ padding:'0 0 8px' }}>
      {/* Header compacto com total */}
      <div style={{ background:'linear-gradient(160deg,#0d1526,#070b16)', padding:'48px 20px 20px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'radial-gradient(circle,rgba(110,231,183,0.07) 0%,transparent 70%)', borderRadius:'50%' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', animation:'fadeUp 0.5s ease both' }}>
          <div>
            <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Total Líquido</p>
            <p style={{ fontSize:'30px', fontWeight:800, color:'#6ee7b7', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em', marginTop:'4px' }}>
              {fmtK(totalLiq)}
            </p>
          </div>
          <button onClick={()=>setShowAdd(!showAdd)} style={{ background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'12px', padding:'8px 14px', color:'#6ee7b7', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            + Adicionar
          </button>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Form adicionar */}
        {showAdd && (
          <div style={{ background:'#111827', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'16px', padding:'16px', marginBottom:'12px', animation:'scaleIn 0.2s ease both' }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'#6ee7b7', marginBottom:'12px' }}>Nova Fonte de Renda</p>
            <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'3px', marginBottom:'12px' }}>
              {[['simples','Renda Simples'],['salario','Formato Salário']].map(([k,l])=>(
                <button key={k} onClick={()=>setNovoTipo(k)} style={{ flex:1, background:novoTipo===k?'rgba(255,255,255,0.1)':'none', border:'none', borderRadius:'8px', padding:'7px', color:novoTipo===k?'#e2e8f0':'rgba(226,232,240,0.4)', fontSize:'12px', fontWeight:novoTipo===k?600:400, cursor:'pointer' }}>{l}</button>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div>
                <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Nome</label>
                <input value={nova.nome} onChange={e=>setNova({...nova,nome:e.target.value})}
                  style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
              </div>
              {novoTipo==='simples' && <>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Valor Mensal (R$)</label>
                  <input type="number" value={nova.valor} onChange={e=>setNova({...nova,valor:e.target.value})}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
                </div>
                <div>
                  <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Categoria</label>
                  <select value={nova.categoria} onChange={e=>setNova({...nova,categoria:e.target.value})}
                    style={{ width:'100%', background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }}>
                    {['Aluguel','Investimentos','Freelance','Dividendos','Outros'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </>}
              <div>
                <label style={{ fontSize:'11px', color:'rgba(226,232,240,0.45)', display:'block', marginBottom:'4px' }}>Descrição</label>
                <input value={nova.descricao} onChange={e=>setNova({...nova,descricao:e.target.value})}
                  style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px', color:'#e2e8f0', fontSize:'13px' }} />
              </div>
              {novoTipo==='salario' && <p style={{ fontSize:'11px', color:'rgba(226,232,240,0.3)', fontStyle:'italic' }}>Preencha os valores após adicionar, expandindo o card.</p>}
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={addRenda} style={{ flex:1, background:'linear-gradient(135deg,#6ee7b7,#3b82f6)', border:'none', borderRadius:'10px', padding:'10px', color:'#070b16', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>Adicionar</button>
                <button onClick={()=>setShowAdd(false)} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'10px', padding:'10px', color:'#e2e8f0', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de rendas */}
        {outrasRendas.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 20px', color:'rgba(226,232,240,0.3)' }}>
            <p style={{ fontSize:'32px', marginBottom:'12px' }}>💼</p>
            <p style={{ fontSize:'14px', marginBottom:'6px' }}>Nenhuma fonte de renda cadastrada</p>
            <p style={{ fontSize:'12px' }}>Clique em "+ Adicionar" para começar</p>
          </div>
        )}

        {outrasRendas.map((r,i) => (
          <div key={r.id} style={{ animation:`fadeUp 0.4s ease ${i*0.05}s both` }}>
            <RendaCard
              renda={r}
              onUpdate={updateOutraRenda}
              onRemove={removeOutraRenda}
              onAddDespesa={addDespesaRenda}
              onRemoveDespesa={removeDespesaRenda}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
