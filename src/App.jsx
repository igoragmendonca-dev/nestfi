import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Proventos from './pages/Proventos'
import Investimentos from './pages/Investimentos'
import Despesas from './pages/Despesas'
import Assinaturas from './pages/Assinaturas'
import Financiamentos from './pages/Financiamentos'
import Patrimonio from './pages/Patrimonio'

const globalStyle = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Sora', sans-serif;
    background: #070b16;
    color: #e2e8f0;
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e2438; border-radius: 2px; }
  input, select, textarea, button { font-family: 'Sora', sans-serif; outline: none; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }
  .card-hover { transition: transform 0.2s ease; }
  .card-hover:hover { transform: translateY(-2px); }
  .btn-press { transition: transform 0.1s ease; }
  .btn-press:active { transform: scale(0.97); }
`

export default function App() {
  return (
    <>
      <style>{globalStyle}</style>
      <div style={{ paddingBottom: '82px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/"               element={<Navigate to="/proventos" replace />} />
          <Route path="/proventos"      element={<Proventos />} />
          <Route path="/investimentos"  element={<Investimentos />} />
          <Route path="/despesas"       element={<Despesas />} />
          <Route path="/assinaturas"    element={<Assinaturas />} />
          <Route path="/financiamentos" element={<Financiamentos />} />
          <Route path="/patrimonio"     element={<Patrimonio />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}
