'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import { useEffect } from 'react'

const CustomDocument = Document.extend({
  content: 'heading block*',
})

export default function ContractEditor({ 
  initialContent, 
  onChange 
}: { 
  initialContent: string
  onChange: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false, // We use custom document to enforce title
        heading: { levels: [1, 2, 3] }
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-p:text-[#94A3B8] prose-headings:text-white max-w-none min-h-[500px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Expose an imperative method to insert clauses (we can pass this via ref or a global state, 
  // but for simplicity we can listen to a custom event or pass down a prop if we hoist the editor instance)
  useEffect(() => {
    const handleInsertClause = (e: CustomEvent<{ content: string }>) => {
      if (editor) {
        editor.commands.insertContent(e.detail.content)
      }
    }
    window.addEventListener('insert-clause', handleInsertClause as EventListener)
    return () => window.removeEventListener('insert-clause', handleInsertClause as EventListener)
  }, [editor])

  if (!editor) {
    return <div className="animate-pulse bg-[#1A1A2E] w-full h-[500px] rounded-xl" />
  }

  return (
    <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Editor Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-white/[0.05] bg-white/[0.02]">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-white/5 text-sm ${editor.isActive('bold') ? 'bg-white/10 text-white' : 'text-[#94A3B8]'}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-white/5 text-sm ${editor.isActive('italic') ? 'bg-white/10 text-white' : 'text-[#94A3B8]'}`}
        >
          Italic
        </button>
        <div className="w-px h-4 bg-white/10 mx-2" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-white/5 text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10 text-white' : 'text-[#94A3B8]'}`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-white/5 text-sm ${editor.isActive('bulletList') ? 'bg-white/10 text-white' : 'text-[#94A3B8]'}`}
        >
          List
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-auto p-8 bg-[#0F0F1A]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
