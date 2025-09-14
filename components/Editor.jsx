"use client";
import { useEffect, useRef } from "react";


export default function Editor({ initialData, onChange, minHeight = 380, placeholder = "✍️ Whisper to the forest…" }) {
const ref = useRef(null);


useEffect(() => {
if (typeof window === "undefined") return;
let editor;
(async () => {
const EditorJS = (await import("@editorjs/editorjs")).default;
const Header = (await import("@editorjs/header")).default;
const List = (await import("@editorjs/list")).default;
const ImageTool = (await import("@editorjs/image")).default;


editor = new EditorJS({
holder: "editorjs",
placeholder,
tools: { header: Header, list: List, image: ImageTool },
data: initialData || { blocks: [] },
async onChange() {
const data = await editor.save();
onChange?.(data);
},
});
})();
return () => editor && editor.destroy?.();
}, []);


return (
<div id="editorjs" ref={ref} style={{ minHeight }} className="p-4 bg-zinc-900/70 rounded-2xl text-white border border-zinc-800" />
);
}
