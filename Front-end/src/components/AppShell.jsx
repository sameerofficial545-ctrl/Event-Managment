import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

function AppShell({ children, headerProps }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="app-shell__main">
        <Header onMenuClick={() => setMenuOpen((v) => !v)} {...headerProps} />
        <main className="app-content">{children}</main>
        <Footer />
      </div>
    </div>
  )
}

export default AppShell
