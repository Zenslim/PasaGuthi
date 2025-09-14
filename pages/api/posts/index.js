import { createClient } from '@supabase/supabase-js'


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)


export default async function handler(req, res) {
if (req.method === 'GET') {
const { data, error } = await supabase.from('posts').select('*').eq('published', true).order('published_at', { ascending: false })
if (error) return res.status(400).json({ error: error.message })
return res.json(data)
} else if (req.method === 'POST') {
// expects { author_id, title, content, ... }
const { data, error } = await supabase.from('posts').insert(req.body).select().single()
if (error) return res.status(400).json({ error: error.message })
return res.status(201).json(data)
}
res.status(405).end()
}
