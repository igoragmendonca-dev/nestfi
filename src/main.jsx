import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import LoginScreen, { isAutenticado } from './components/LoginScreen'
import useFinancasStore from './store'
import './index.css'

function Root() {
  const [autenticado, setAutenticado] = useState(isAutenticado())
  const [carregando, setCarregando]   = useState(true)
  const carregarDaCloud = useFinancasStore(s => s.carregarDaCloud)

  useEffect(() => {
    carregarDaCloud().finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <div style={{ minHeight:'100vh', background:'#070b16', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid rgba(110,231,183,0.2)', borderTop:'3px solid #6ee7b7', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <p style={{ color:'rgba(226,232,240,0.4)', fontSize:'13px', fontFamily:"'Sora',sans-serif" }}>Carregando NestFi...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!autenticado) {
    return <LoginScreen onLogin={() => setAutenticado(true)} />
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
