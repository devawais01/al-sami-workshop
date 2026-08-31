import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  await db.from('workshop').select('id').limit(1)
  return new Response('ok', { headers: { 'Content-Type': 'text/plain' } })
})