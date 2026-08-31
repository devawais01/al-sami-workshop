import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return json({ error: 'No token' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { data: caller } = await admin.auth.getUser(token)
    if (!caller.user) return json({ error: 'Bad token' }, 401)

    const { data: me } = await admin
      .from('workshop_member')
      .select('workshop_id, role')
      .eq('user_id', caller.user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!me) return json({ error: 'Sirf admin naya user bana sakta hai.' }, 403)

    const { email, password, role } = await req.json()
    if (!email || !password) return json({ error: 'Email aur password zaroori hain.' }, 400)
    if (!['malik', 'dekhne_wala'].includes(role)) return json({ error: 'Ghalat role.' }, 400)

    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (cErr) return json({ error: cErr.message }, 400)

    const { error: mErr } = await admin.from('workshop_member').insert({
      workshop_id: me.workshop_id,
      user_id: created.user.id,
      role,
    })
    if (mErr) {
      await admin.auth.admin.deleteUser(created.user.id)
      return json({ error: mErr.message }, 400)
    }

    return json({ ok: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})