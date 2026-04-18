import type { JSONContent } from '@tiptap/core'
import { Array as Arr, Option, pipe } from 'effect'

const extractText = (node: Option.Option<JSONContent>): string =>
  Option.match(node, {
    onNone: () => '',
    onSome: (n) =>
      Option.match(Option.fromNullable(n.text), {
        onSome: (text) => text,
        onNone: () =>
          Option.match(Option.fromNullable(n.content), {
            onSome: (content) => content.map((child) => extractText(Option.some(child))).join(''),
            onNone: () => '',
          }),
      }),
  })

export const previewTitle = (doc: JSONContent): string => {
  const nodes: readonly JSONContent[] = Option.getOrElse(Option.fromNullable(doc.content), () => [])
  const h1 = pipe(
    nodes,
    Arr.findFirst(
      (n) =>
        n.type === 'heading' &&
        Option.match(Option.fromNullable(n.attrs), {
          onNone: () => false,
          onSome: (attrs) => attrs.level === 1,
        }),
    ),
  )
  const target = Option.orElse(h1, () => Arr.get(nodes, 0))
  const text = extractText(target).trim()
  return text.length > 0 ? text.slice(0, 40) : 'Untitled'
}
