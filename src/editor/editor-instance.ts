import { Editor, type JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Chunk, Effect, type Scope, Stream } from 'effect'

export type TransactionPayload = {
  readonly docChanged: boolean
  readonly stepsJson: readonly unknown[]
  readonly docJson: JSONContent
}

export type EditorCore = {
  readonly view: HTMLElement
  readonly instance: Editor
  readonly getJSON: () => JSONContent
  readonly setContent: (content: JSONContent) => void
  readonly setEditable: (editable: boolean) => void
  readonly transactions$: Stream.Stream<TransactionPayload>
}

export const createEditor = (params: {
  initial: JSONContent
}): Effect.Effect<EditorCore, never, Scope.Scope> =>
  Effect.gen(function* () {
    const view = document.createElement('div')
    view.className = 'editor'

    const instance = yield* Effect.acquireRelease(
      Effect.sync(
        () =>
          new Editor({
            element: view,
            extensions: [StarterKit],
            content: params.initial,
          }),
      ),
      (editor) =>
        Effect.sync(() => {
          editor.destroy()
        }),
    )

    const transactions$ = Stream.async<TransactionPayload>((emit) => {
      const listener = (props: {
        transaction: { docChanged: boolean; steps: { toJSON(): unknown }[] }
      }): void => {
        const payload: TransactionPayload = {
          docChanged: props.transaction.docChanged,
          stepsJson: props.transaction.steps.map((s) => s.toJSON()),
          docJson: instance.getJSON(),
        }
        void emit(Effect.succeed(Chunk.of(payload)))
      }
      instance.on('transaction', listener)
      return Effect.sync(() => {
        instance.off('transaction', listener)
      })
    })

    return {
      view,
      instance,
      getJSON: () => instance.getJSON(),
      setContent: (content) => {
        instance.commands.setContent(content)
      },
      setEditable: (editable) => {
        instance.setEditable(editable)
      },
      transactions$,
    }
  })
