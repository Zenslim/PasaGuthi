import { supabase } from '@/lib/supabaseClient'
<div className="prose prose-invert max-w-none">
{(data?.blocks || []).map((b, i) => {
if (b.type === 'header') return <h2 key={i}>{b.data.text}</h2>
if (b.type === 'paragraph') return <p key={i} dangerouslySetInnerHTML={{ __html: b.data.text }} />
if (b.type === 'list') return (
<ul key={i} className="list-disc ml-6">
{(b.data.items || []).map((li, j) => (
<li key={j} dangerouslySetInnerHTML={{ __html: li }} />
))}
</ul>
)
return null
})}
</div>
)
}


export async function getServerSideProps({ params }) {
const { data, error } = await supabase
.from('posts')
.select('*')
.eq('slug', params.slug)
.single()


if (!data || !data.published) {
return { notFound: true }
}


return { props: { post: data } }
}


export default function PostPage({ post }) {
return (
<main className="max-w-3xl mx-auto px-4 py-10">
<Head><title>{post.title} – Pasaguthi</title></Head>
{post.cover_image_url && (
<img src={post.cover_image_url} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
)}
<h1 className="text-4xl font-bold mb-2">{post.title}</h1>
{post.excerpt && <p className="text-zinc-300 mb-8">{post.excerpt}</p>}
<RenderContent data={post.content} />
</main>
)
}
