// pages/blog/index.jsx
import { supabase } from '@/lib/supabaseClient'
import BlogCard from '@/components/BlogCard'

export async function getServerSideProps() {
  const { data } = await supabase
    .from('posts')
    .select('id,title,slug,excerpt,cover_image_url,tags,published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return { props: { initialPosts: data || [] } }
}

export default function BlogIndex({ initialPosts }) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Ritual Feed</h1>
        <p className="text-zinc-400">Reflections • Service Acts • Cultural Memory</p>
      </header>
      <section className="grid md:grid-cols-2 gap-6">
        {initialPosts.map((p) => (
          <BlogCard key={p.id} post={p} />
        ))}
      </section>
    </main>
  )
}
