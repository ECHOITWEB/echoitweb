import { useCallback, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Code
} from 'lucide-react'

interface BlogEditorProps {
  content: string
  onChange: (content: string) => void
  label?: string
  placeholder?: string
  isInvalid?: boolean
  errorMessage?: string
}

export function BlogEditor({
  content,
  onChange,
  label,
  placeholder,
  isInvalid,
  errorMessage
}: BlogEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  })

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('이미지 업로드 실패')

      const { url } = await response.json()
      editor?.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error)
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  }, [editor])

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  if (!editor) return null

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className={`border rounded-lg overflow-hidden ${isInvalid ? 'border-red-500' : 'border-gray-300'}`}>
        <div className="bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-1">
          <Toggle
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
          >
            <Underline className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          <Toggle
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
          >
            <List className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Ordered list"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          <Toggle
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            aria-label="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const url = window.prompt('URL 입력:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            aria-label="Add link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            aria-label="Add image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageInputChange}
            className="hidden"
          />
        </div>
        
        <div
          className={`p-4 min-h-[200px] prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none ${
            isInvalid ? 'prose-red' : ''
          }`}
          onClick={() => editor.chain().focus().run()}
        >
          {editor.view.dom}
        </div>
      </div>
      
      {isInvalid && errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  )
} 