import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App'
import { CaseStudy } from './routes/CaseStudy'
import { WorkIndex } from './routes/WorkIndex'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/work" element={<WorkIndex />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        {/* Catch-all → home (graceful 404) */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
