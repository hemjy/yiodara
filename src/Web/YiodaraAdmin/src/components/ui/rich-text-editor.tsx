import React, { useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon, 
  List, 
  AlignLeft,
  Smile,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
}: RichTextEditorProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  return (
    <div className={`border-2 rounded-lg overflow-hidden border-gray-200 focus-within:border-[#BA24D5] focus-within:ring-0 focus-within:outline-none ${className}`}>
      <div className="flex items-center p-2 border-b bg-white">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor?.isActive('bold') ? 'bg-gray-100' : ''
          }`}
          type="button"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100' : ''}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-100' : ''}`}
          title="Underline"
        >
          <Underline size={18} />
        </button>
        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-100' : ''}`}
          title="Link"
        >
          <LinkIcon size={18} />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-gray-100"
          title="Emoji"
        >
          <Smile size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-100' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-100' : ''}`}
          title="Ordered List"
        >
          <AlignLeft size={18} />
        </button>
        
        <div className="ml-auto flex">
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-100"
            type="button"
            disabled={!editor?.can().undo()}
          >
            <Undo size={18} />
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-100"
            type="button"
            disabled={!editor?.can().redo()}
          >
            <Redo size={18} />
          </button>
        </div>
      </div>
      
      {showLinkInput && (
        <div className="p-2 border-b bg-white">
          <form onSubmit={handleLinkSubmit} className="flex">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-grow border rounded-l px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-3 py-1 rounded-r"
            >
              Add
            </button>
          </form>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[200px] bg-gray-50 text-gray-600 focus:outline-none" 
      />
      
      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
        }
        .ProseMirror:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .ProseMirror-focused {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}; 