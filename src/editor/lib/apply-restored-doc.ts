import { Step } from '@tiptap/pm/transform'
import type { JSONContent, useEditor } from '@tiptap/react'
import { EMPTY_CONTENT } from '~/editor/lib/empty-content'

type TiptapEditor = NonNullable<ReturnType<typeof useEditor>>

export const applyRestoredDoc = (
  editor: TiptapEditor,
  snapshotState: string | null,
  events: readonly { payload: string }[],
  loadingRef: { current: boolean },
) => {
  loadingRef.current = true
  const base: JSONContent = snapshotState ? JSON.parse(snapshotState) : EMPTY_CONTENT
  editor.commands.setContent(base)
  for (const ev of events) {
    const step = Step.fromJSON(editor.schema, JSON.parse(ev.payload))
    const tr = editor.state.tr.step(step)
    editor.view.dispatch(tr)
  }
  loadingRef.current = false
}
