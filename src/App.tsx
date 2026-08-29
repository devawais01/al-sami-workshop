import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    supabase
      .from('workshop')
      .select('name')
      .then(({ data, error }) => {
        if (error) setStatus('Error: ' + error.message)
        else if (!data?.length) setStatus('Connected. 0 rows (RLS working — not logged in)')
        else setStatus('Connected. Found: ' + data[0].name)
      })
  }, [])

  return (
    <div className="min-h-screen bg-chalk flex items-center justify-center p-6">
      <div className="rounded-xl border border-line bg-surface p-6 max-w-md">
        <h1 className="font-display text-2xl text-indigo">Karigar Book</h1>
        <p className="mt-2 text-sm text-muted">{status}</p>
      </div>
    </div>
  )
}