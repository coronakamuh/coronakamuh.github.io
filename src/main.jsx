import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { ErrorBoundary } from '@/components/error-boundary'
import { SplashAwal } from '@/components/splash-awal'

// Mode offline: simpan cangkang aplikasi (bukan data) agar tetap terbuka tanpa internet.
if (import.meta.env.PROD && 'serviceWorker' in navigator && !window.Capacitor?.isNativePlatform?.()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <SplashAwal />
  </StrictMode>,
)
