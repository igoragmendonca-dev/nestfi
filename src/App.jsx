import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Proventos from './pages/Proventos'
import Investimentos from './pages/Investimentos'
import Despesas from './pages/Despesas'
import Assinaturas from './pages/Assinaturas'
import Financiamentos from './pages/Financiamentos'
import Simulador from './pages/Simulador'

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
  input, select, textarea, button {
    font-family: 'Sora', sans-serif;
    outline: none;
  }
  input[type=range] {
    -webkit-appearance: none;
    height: 4px;
    border-radius: 2px;
    background: rgba(255,255,255,0.08);
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #6ee7b7;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(110,231,183,0.5);
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
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
          <Route path="/"               element={<Dashboard />} />
          <Route path="/proventos"      element={<Proventos />} />
          <Route path="/investimentos"  element={<Investimentos />} />
          <Route path="/despesas"       element={<Despesas />} />
          <Route path="/assinaturas"    element={<Assinaturas />} />
          <Route path="/financiamentos" element={<Financiamentos />} />
          <Route path="/simulador"      element={<Simulador />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}
