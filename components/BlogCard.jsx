import Link from 'next/link'


export default function BlogCard({ post }) {
return (
<article className="rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition">
{post.cover_image_url && (
<img src={post.cover_image_url} alt={post.title} className="w-full h-48 object-cover" />
)}
<div className="p-5">
<h3 className="text-xl font-semibold mb-2">
<Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
</h3>
{post.excerpt && <p className="text-zinc-300 mb-3 line-clamp-2">{post.excerpt}</p>}
<div className="text-xs text-zinc-400 flex gap-2 flex-wrap">
{(post.tags || []).map((t) => (
<span key={t} className="px-2 py-0.5 rounded-full bg-zinc-800">#{t}</span>
))}
</div>
</div>
</article>
)}
