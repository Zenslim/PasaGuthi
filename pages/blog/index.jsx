"use client";
value={title}
onChange={(e) => setTitle(e.target.value)}
maxLength={120}
/>
<div className="mt-1 text-xs text-zinc-500 text-right">{titleCount}/120</div>
</div>


{/* Excerpt */}
<div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
<label className="block text-sm text-zinc-400 mb-2">Excerpt (optional)</label>
<textarea
className="w-full bg-transparent outline-none resize-none h-20 placeholder:text-zinc-600"
placeholder="One sentence that invites the village…"
value={excerpt}
onChange={(e) => setExcerpt(e.target.value)}
maxLength={220}
/>
<div className="mt-1 text-xs text-zinc-500 text-right">{excerptCount}/220</div>
</div>


{/* Editor */}
<div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
<label className="block text-sm text-zinc-400 mb-3">Story</label>
<Editor initialData={content} onChange={setContent} minHeight={420} />
</div>
</section>


{/* Right: meta */}
<aside className="space-y-6">
<div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
<label className="block text-sm text-zinc-400 mb-2">Tags</label>
<TagInput value={tags} onChange={setTags} />
<p className="mt-2 text-xs text-zinc-500">Press <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Enter</kbd> or comma to add</p>
</div>


<div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
<label className="block text-sm text-zinc-400 mb-3">Cover image</label>
<CoverPicker value={cover} onChange={setCover} />
</div>


<div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
<h3 className="font-semibold mb-2">Tips</h3>
<ul className="text-sm text-zinc-400 list-disc ml-5 space-y-1">
<li>Short title, strong verb.</li>
<li>One idea → one section.</li>
<li>Use tags like <span className="text-emerald-300">ritual</span>, <span className="text-emerald-300">agroforestry</span>, <span className="text-emerald-300">craft</span>.</li>
</ul>
</div>
</aside>
</div>


{/* Sticky Action Bar */}
<div className="sticky bottom-0 z-30 border-t border-zinc-800 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/70">
<div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 justify-end">
<button
onClick={() => save(false)}
disabled={busy}
className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
>Save Draft ⌘S</button>
<button
onClick={() => save(true)}
disabled={!canPublish}
className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold disabled:opacity-50"
>Publish ⌘⏎</button>
</div>
</div>
</main>
);
}
