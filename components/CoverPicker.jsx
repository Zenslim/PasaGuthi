"use client";
import { useState, useEffect } from "react";


export default function CoverPicker({ value, onChange }) {
const [url, setUrl] = useState(value || "");
const [ok, setOk] = useState(false);


useEffect(() => {
const img = new Image();
if (!url) { setOk(false); return; }
img.onload = () => setOk(true);
img.onerror = () => setOk(false);
img.src = url;
}, [url]);


useEffect(() => { onChange?.(ok ? url : ""); }, [ok]);


return (
<div className="space-y-3">
<div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 aspect-[16/9] grid place-items-center">
{ok && url ? (
// eslint-disable-next-line @next/next/no-img-element
<img src={url} alt="Cover" className="w-full h-full object-cover" />
) : (
<div className="text-zinc-500 text-sm">Paste an image URL to preview</div>
)}
</div>
<input
className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
placeholder="https://…/cover.jpg"
value={url}
onChange={(e) => setUrl(e.target.value)}
/>
</div>
);
}
