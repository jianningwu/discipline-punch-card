import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { initAuthFromStorage } from './stores/authStore'
import { initSettingsFromStorage } from './stores/settingsStore'
import './index.css'

// Initialize from localStorage
initAuthFromStorage()
initSettingsFromStorage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
