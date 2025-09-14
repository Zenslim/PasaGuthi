import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)


export default async function handler(req, res) {
const { id } = req.query
if (req.method === 'GET') {
const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
if (error) return res.status(404).json({ error: error.message })
return res.json(data)
}
if (req.method === 'PUT') {
const { data, error } = await supabase.from('posts').update(req.body).eq('id', id).select().single()
if (error) return res.status(400).json({ error: error.message })
return res.json(data)
}
if (req.method === 'DELETE') {
const { error } = await supabase.from('posts').delete().eq('id', id)
if (error) return res.status(400).json({ error: error.message })
return res.status(204).end()
}
res.status(405).end()
}
