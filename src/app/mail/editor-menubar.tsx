// "use client"
import React from 'react'
import { type Editor } from '@tiptap/react'
import { Bold, Code, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Italic, List, ListOrdered, Quote, Redo, Strikethrough, Undo } from 'lucide-react'

type Props = {
    editor: Editor
}

const EditorMenubar = ({editor}: Props) => {
  return (
    <div className='flex flex-wrap gap-2'>
        <button
            type='button'
            title='bold'
            onClick={() => {
                editor.chain().focus().toggleBold().run()
            }}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
        >
            <Bold className='size-4 text-secondary-foreground' />
        </button>
        <button
            type='button'
            title='italic'
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "is-active" : ""}
        >
            <Italic className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='strikethrough'
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "is-active" : ""}
        >
            <Strikethrough className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='code'
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "is-active" : ""}
        >
            <Code className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='heading1'
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
        >
            <Heading1 className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='heading2'
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
        >
            <Heading2 className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='heading3'
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
        >
            <Heading3 className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='heading4'
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
        >
            <Heading4 className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='heading5'
            onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
            className={editor.isActive("heading", { level: 5 }) ? "is-active" : ""}
        >
            <Heading5 className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='heading6'
            onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
            className={editor.isActive("heading", { level: 6 }) ? "is-active" : ""}
        >
            <Heading6 className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='list'
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "is-active" : ""}
        >
            <List className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='Ordered List'
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "is-active" : ""}
        >
            <ListOrdered className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='Quote'
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "is-active" : ""}
        >
            <Quote className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='undo'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
        >
            <Undo className="size-4 text-secondary-foreground" />
        </button>
        <button
            type='button'
            title='Redo'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
        >
            <Redo className="size-4 text-secondary-foreground" />
        </button>
        
    </div>
  )
}

export default EditorMenubar