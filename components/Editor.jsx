import { useEffect, useRef } from 'react'


export default function Editor({ initialData, onChange }) {
const ref = useRef(null)


useEffect(() => {
let editor
;(async () => {
const EditorJS = (await import('@editorjs/editorjs')).default
const Header = (await import('@editorjs/header')).default
const List = (await import('@editorjs/list')).default
const ImageTool = (await import('@editorjs/image')).default


editor = new EditorJS({
holder: 'editorjs',
placeholder: '✍️ Whisper to the forest…',
tools: { header: Header, list: List, image: ImageTool },
data: initialData || { blocks: [] },
onChange: async () => {
const data = await editor.save()
onChange?.(data)
}
})
})()
return () => { editor && editor.destroy?.() }
}, [])


return <div id="editorjs" ref={ref} className="min-h-[300px] p-4 bg-zinc-900 rounded-2xl text-white" />
}
