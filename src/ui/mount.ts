import { Effect, Scope } from 'effect'

const detach = (child: Node): void => {
  const parent = child.parentNode
  if (parent !== null) parent.removeChild(child)
}

export const mount = (parent: Element, child: Node): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope
    parent.appendChild(child)
    yield* Scope.addFinalizer(
      scope,
      Effect.sync(() => detach(child)),
    )
  })
