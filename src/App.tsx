import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import { t } from './lib/strings'
import Login from './screens/Login'
import Workers from './screens/Workers'
import WorkerChat from './screens/WorkerChat'
import WorkerProfile from './screens/WorkerProfile'
import EditWorker from './screens/EditWorker'
import EditDress from './screens/EditDress'
import Report from './screens/Report'
import Lots from './screens/Lots'
import Users from './screens/Users'
import Nav from './components/Nav'
import { useLocation } from 'react-router-dom'

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

  const hideNav =
    pathname.startsWith('/karigar/') ||
    pathname.startsWith('/dress/') ||
    pathname === '/users'

  return (
    <>
      <Routes>
        <Route path="/" element={<Workers />} />
        <Route path="/karigar/:id" element={<WorkerChat />} />
        <Route path="/karigar/:id/profile" element={<WorkerProfile />} />
        <Route path="/karigar/:id/edit" element={<EditWorker />} />
        <Route path="/dress/:id/edit" element={<EditDress />} />
        <Route path="/lot" element={<Lots />} />
        <Route path="/users" element={<Users />} />
        <Route path="/hisaab" element={<Report />} />
      </Routes>

      {!hideNav && <Nav />}
    </>
  )
}