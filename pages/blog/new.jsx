"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Editor from "@/components/Editor";
import TagInput from "@/components/TagInput";
import CoverPicker from "@/components/CoverPicker";
import toast, { Toaster } from "react-hot-toast";

export default function NewPost() {
  const [session, setSession] = useState(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState({ blocks: [] });
  const [cover, setCover] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function save(publish = false) {
    if (!session) return toast.error("⚠️ Sign in to post");
    setPublishing(true);

    const author_id = session.user.id;
    const payload = {
      author_id,
      title,
      excerpt,
      content,
      cover_image_url: cover || null,
      tags,
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("posts")
      .insert(payload)
      .select()
      .single();

    setPublishing(false);
    if (error) return toast.error(error.message);
    toast.success("✨ Whisper published!");
    window.location.href = `/blog/${data.slug}`;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Toaster position="top-right" />
      {/* Sticky header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/50 border-b border-zinc-800 py-3 mb-6 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Whisper to the Forest</h1>
        <div className="flex gap-3">
          <button
            onClick={() => save(false)}
            disabled={publishing}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
          >
            Save Draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={publishing}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Cover image */}
      <CoverPicker value={cover} onChange={setCover} />

      {/* Title + excerpt */}
      <input
        className="w-full bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl text-xl font-semibold"
        placeholder="Title of your whisper…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl"
        placeholder="Excerpt (optional)"
        rows={2}
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />

      {/* Tags */}
      <TagInput value={tags} onChange={setTags} placeholder="Add tags…" />

      {/* Editor */}
      <Editor initialData={content} onChange={setContent} />
    </main>
  );
}
