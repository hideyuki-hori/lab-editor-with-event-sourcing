import type { JSONContent } from '@tiptap/core'

export const EMPTY_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Untitled' }] },
    { type: 'paragraph' },
  ],
}
