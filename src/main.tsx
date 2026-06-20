import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App'
import { ScrollToTopOnNavigate } from './components/ScrollToTopOnNavigate'
import { CaseStudy, ContactPage, NotFoundPage, WorkIndex } from './routes/lazyRoutes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user" lets framer-motion honor the OS-level
          prefers-reduced-motion setting for all transform animations */}
      <MotionConfig reducedMotion="user">
        <ScrollToTopOnNavigate />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/work" element={<WorkIndex />} />
            <Route path="/work/:slug" element={<CaseStudy />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Catch-all → SIGNAL LOST (the dead-channel 404) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
