import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Editor from '@/components/Editor'


export default function NewPost() {
const [session, setSession] = useState(null)
const [title, setTitle] = useState('')
const [excerpt, setExcerpt] = useState('')
const [tags, setTags] = useState('')
const [content, setContent] = useState({ blocks: [] })
const [cover, setCover] = useState('')
const [publishing, setPublishing] = useState(false)


useEffect(() => {
supabase.auth.getSession().then(({ data }) => setSession(data.session))
const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
return () => sub.subscription.unsubscribe()
}, [])


async function save(publish = false) {
if (!session) return alert('Sign in to post')
setPublishing(true)


const author_id = session.user.id
const payload = {
author_id,
title,
excerpt,
content,
cover_image_url: cover || null,
tags: tags ? tags.split(',').map((t) => t.trim()) : [],
published: publish,
published_at: publish ? new Date().toISOString() : null
}


const { data, error } = await supabase.from('posts').insert(payload).select().single()
setPublishing(false)
if (error) return alert(error.message)
window.location.href = `/blog/${data.slug}`
}


return (
<main className="max-w-3xl mx-auto px-4 py-10">
<h1 className="text-3xl font-bold mb-6">Whisper to the Forest</h1>
<div className="space-y-4">
<input className="w-full bg-zinc-900 p-3 rounded-xl" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
<input className="w-full bg-zinc-900 p-3 rounded-xl" placeholder="Excerpt (optional)" value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} />
<input className="w-full bg-zinc-900 p-3 rounded-xl" placeholder="Cover image URL (optional)" value={cover} onChange={(e)=>setCover(e.target.value)} />
<input className="w-full bg-zinc-900 p-3 rounded-xl" placeholder="tags (comma separated)" value={tags} onChange={(e)=>setTags(e.target.value)} />
<Editor initialData={content} onChange={setContent} />
<div className="flex gap-3">
<button onClick={()=>save(false)} disabled={publishing} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">Save Draft</button>
<button onClick={()=>save(true)} disabled={publishing} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white">Publish</button>
</div>
</div>
</main>
)
}
