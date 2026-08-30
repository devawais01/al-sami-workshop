import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import { t } from './lib/strings'
import Login from './screens/Login'
import Workers from './screens/Workers'
import WorkerChat from './screens/WorkerChat'
import WorkerProfile from './screens/WorkerProfile'
import Lots from './screens/Lots'
import Nav from './components/Nav'
import { useLocation } from 'react-router-dom'

function Report() {
  return (
    <div className="min-h-screen bg-chalk p-5 pb-24">
      <h1 className="font-display text-2xl text-indigo">{t.nav.report}</h1>
      <p className="mt-2 text-sm text-muted">Ye hissa abhi banaya nahi gaya.</p>
    </div>
  )
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-chalk flex items-center justify-center">
        <p className="text-muted">{t.common.loading}</p>
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}

function Shell() {
  const { pathname } = useLocation()
  const hideNav = pathname.startsWith('/karigar/')

  return (
    <>
      <Routes>
        <Route path="/" element={<Workers />} />
        <Route path="/karigar/:id" element={<WorkerChat />} />
        <Route path="/karigar/:id/profile" element={<WorkerProfile />} />
        <Route path="/lot" element={<Lots />} />
        <Route path="/hisaab" element={<Report />} />
      </Routes>
      {!hideNav && <Nav />}
    </>
  )
}