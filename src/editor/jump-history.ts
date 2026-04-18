import { Effect, Option, Stream, SubscriptionRef } from 'effect'
import type { JumpEntry } from '~/editor/types/jump-entry'

export type JumpHistory = {
  readonly undoSize$: Stream.Stream<number>
  readonly redoSize$: Stream.Stream<number>
  readonly push: (entry: JumpEntry) => Effect.Effect<void>
  readonly popUndo: Effect.Effect<Option.Option<JumpEntry>>
  readonly popRedo: Effect.Effect<Option.Option<JumpEntry>>
  readonly clear: Effect.Effect<void>
}

export const jumpHistory = (): Effect.Effect<JumpHistory> =>
  Effect.gen(function* () {
    const undo$ = yield* SubscriptionRef.make<readonly JumpEntry[]>([])
    const redo$ = yield* SubscriptionRef.make<readonly JumpEntry[]>([])

    const push = (entry: JumpEntry): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* SubscriptionRef.update(undo$, (stack) => [...stack, entry])
        yield* SubscriptionRef.set(redo$, [])
      })

    const popUndo: Effect.Effect<Option.Option<JumpEntry>> = Effect.gen(function* () {
      const stack = yield* SubscriptionRef.get(undo$)
      if (stack.length === 0) return Option.none()
      const entry = stack[stack.length - 1]
      yield* SubscriptionRef.set(undo$, stack.slice(0, -1))
      yield* SubscriptionRef.update(redo$, (r) => [...r, entry])
      return Option.some(entry)
    })

    const popRedo: Effect.Effect<Option.Option<JumpEntry>> = Effect.gen(function* () {
      const stack = yield* SubscriptionRef.get(redo$)
      if (stack.length === 0) return Option.none()
      const entry = stack[stack.length - 1]
      yield* SubscriptionRef.set(redo$, stack.slice(0, -1))
      yield* SubscriptionRef.update(undo$, (u) => [...u, entry])
      return Option.some(entry)
    })

    const clear: Effect.Effect<void> = Effect.gen(function* () {
      yield* SubscriptionRef.set(undo$, [])
      yield* SubscriptionRef.set(redo$, [])
    })

    return {
      undoSize$: undo$.changes.pipe(Stream.map((s) => s.length)),
      redoSize$: redo$.changes.pipe(Stream.map((s) => s.length)),
      push,
      popUndo,
      popRedo,
      clear,
    }
  })
