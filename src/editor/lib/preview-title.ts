import type { JSONContent } from '@tiptap/react'

const extractText = (node?: JSONContent): string => {
  if (!node) return ''
  if (node.text) return node.text
  if (node.content) return node.content.map(extractText).join('')
  return ''
}

export const previewTitle = (doc: JSONContent) => {
  const nodes = doc.content ?? []
  const h1 = nodes.find((n) => n.type === 'heading' && n.attrs?.level === 1)
  const target = h1 ?? nodes[0]
  const text = extractText(target).trim()
  return text.length > 0 ? text.slice(0, 40) : 'Untitled'
}
