import { Effect, Option, Ref, type Scope, Stream } from 'effect'
import { mount } from '~/ui/mount'
import { closeChildScope, runInChildScope } from '~/ui/scope-el'

export const bindWhen = <A>(
  parent: Element,
  s: Stream.Stream<Option.Option<A>>,
  render: (a: A) => Effect.Effect<HTMLElement, never, Scope.Scope>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const parentScope = yield* Effect.scope
    const current = yield* Ref.make<Option.Option<Scope.CloseableScope>>(Option.none())

    const loop = Stream.runForEach(s, (value) =>
      Effect.gen(function* () {
        const previous = yield* Ref.get(current)
        if (Option.isSome(previous)) {
          yield* closeChildScope(previous.value)
          yield* Ref.set(current, Option.none())
        }
        if (Option.isNone(value)) return
        const rendered = yield* runInChildScope(
          parentScope,
          Effect.gen(function* () {
            const el = yield* render(value.value)
            yield* mount(parent, el)
            return el
          }),
        )
        yield* Ref.set(current, Option.some(rendered.scope))
      }),
    )
    yield* Effect.forkIn(loop, parentScope)
  })
