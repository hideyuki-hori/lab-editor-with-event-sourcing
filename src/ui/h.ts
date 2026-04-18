export type Child = Node | string

type DataAttrs = { readonly [key: `data-${string}`]: string | undefined }
type AriaAttrs = { readonly [key: `aria-${string}`]: string | undefined }

export type Attrs = {
  readonly class?: string
  readonly id?: string
  readonly role?: string
  readonly title?: string
  readonly type?: string
} & DataAttrs &
  AriaAttrs

const toNode = (child: Child): Node =>
  typeof child === 'string' ? document.createTextNode(child) : child

const applyAttrs = (el: Element, attrs: Attrs): void => {
  for (const key of Object.keys(attrs)) {
    const value = Reflect.get(attrs, key)
    if (value === undefined) continue
    if (typeof value !== 'string') continue
    if (key === 'class') {
      el.setAttribute('class', value)
      continue
    }
    el.setAttribute(key, value)
  }
}

export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs,
  children?: readonly Child[],
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag)
  if (attrs !== undefined) applyAttrs(el, attrs)
  if (children !== undefined) {
    for (const child of children) el.appendChild(toNode(child))
  }
  return el
}
