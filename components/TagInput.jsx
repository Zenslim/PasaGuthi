"use client";
import { useState, useRef, useEffect } from "react";


export default function TagInput({ value = [], onChange, placeholder = "Add a tag and press Enter" }) {
const [input, setInput] = useState("");
const ref = useRef(null);


useEffect(() => {
const onKey = (e) => {
if ((e.key === "Enter" || e.key === ",") && input.trim()) {
e.preventDefault();
const t = input.trim();
if (!value.includes(t)) onChange?.([...value, t]);
setInput("");
}
if (e.key === "Backspace" && !input && value.length) {
onChange?.(value.slice(0, -1));
}
};
const el = ref.current;
el?.addEventListener("keydown", onKey);
return () => el?.removeEventListener("keydown", onKey);
}, [input, value, onChange]);


return (
<div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-2 flex flex-wrap gap-2">
{value.map((t) => (
<span key={t} className="px-2 py-1 text-xs rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-700/30">
{t}
<button className="ml-1 opacity-70 hover:opacity-100" onClick={() => onChange?.(value.filter((x) => x !== t))}>×</button>
</span>
))}
<input
ref={ref}
className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-500"
placeholder={placeholder}
value={input}
onChange={(e) => setInput(e.target.value)}
/>
</div>
);
}
