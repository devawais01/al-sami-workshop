import { useAuth } from './lib/useAuth'
import { supabase } from './lib/supabase'
import { t } from './lib/strings'
import Login from './screens/Login'
import Workers from './screens/Workers'

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

  return <Workers />
}