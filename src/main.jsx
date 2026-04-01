import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import LoginScreen, { isAutenticado } from './components/LoginScreen'
import './index.css'

function Root() {
  const [autenticado, setAutenticado] = useState(isAutenticado())
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
