import { Effect, Ref, type Scope, Stream } from 'effect'
import { mount } from '~/ui/mount'
import { closeChildScope, runInChildScope } from '~/ui/scope-el'

type Entry = {
  readonly el: HTMLElement
  readonly scope: Scope.CloseableScope
}

export const bindList = <A>(
  parent: Element,
  s: Stream.Stream<readonly A[]>,
  keyOf: (a: A) => string,
  renderItem: (a: A) => Effect.Effect<HTMLElement, never, Scope.Scope>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const parentScope = yield* Effect.scope
    const entries = yield* Ref.make(new Map<string, Entry>())

    const loop = Stream.runForEach(s, (items) =>
      Effect.gen(function* () {
        const previous = yield* Ref.get(entries)
        const next = new Map<string, Entry>()

        const seenKeys = new Set<string>()
        for (const item of items) {
          const key = keyOf(item)
          if (seenKeys.has(key)) continue
          seenKeys.add(key)
          const kept = previous.get(key)
          if (kept !== undefined) {
            next.set(key, kept)
            continue
          }
          const rendered = yield* runInChildScope(
            parentScope,
            Effect.gen(function* () {
              const el = yield* renderItem(item)
              yield* mount(parent, el)
              return el
            }),
          )
          next.set(key, { el: rendered.value, scope: rendered.scope })
        }

        for (const [key, entry] of previous) {
          if (next.has(key)) continue
          yield* closeChildScope(entry.scope)
        }

        const desiredOrder: HTMLElement[] = []
        for (const item of items) {
          const key = keyOf(item)
          const entry = next.get(key)
          if (entry === undefined) continue
          desiredOrder.push(entry.el)
        }
        for (let i = 0; i < desiredOrder.length; i += 1) {
          const el = desiredOrder[i]
          const currentAt = parent.childNodes.item(i)
          if (currentAt === el) continue
          parent.insertBefore(el, currentAt)
        }

        yield* Ref.set(entries, next)
      }),
    )

    yield* Effect.forkIn(loop, parentScope)
  })
