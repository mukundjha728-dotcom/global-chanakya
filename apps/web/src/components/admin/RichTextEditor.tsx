'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

export default function RichTextEditor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] border p-4 rounded-md',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 p-2 border border-b-0 rounded-t-md bg-muted">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 text-sm rounded-md ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 text-sm rounded-md ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-sm rounded-md ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
        >
          H2
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
