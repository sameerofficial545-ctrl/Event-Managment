import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="app-shell__main">
        <Header onMenuClick={() => setMenuOpen((v) => !v)} />

        <main className="app-content">
          <section className="page-intro">
            <span className="page-intro__eyebrow">Welcome back</span>
            <h2 className="page-intro__title">Your events, beautifully organized</h2>
            <p className="page-intro__text">
              This layout is powered by the new <code>Sidebar</code>, <code>Header</code> and{' '}
              <code>Footer</code> components — plug in your dashboard content here.
            </p>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default App
