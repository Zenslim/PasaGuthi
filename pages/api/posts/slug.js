import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)


export default async function handler(req, res) {
const { slug } = req.query
const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single()
if (error) return res.status(404).json({ error: error.message })
return res.json(data)
}
