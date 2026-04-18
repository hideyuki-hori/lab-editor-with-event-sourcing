import { Effect, ExecutionStrategy, Exit, Scope } from 'effect'

export const forkChildScope = (
  parent: Scope.Scope,
): Effect.Effect<Scope.CloseableScope, never, never> =>
  Scope.fork(parent, ExecutionStrategy.sequential)

export const closeChildScope = (scope: Scope.CloseableScope): Effect.Effect<void, never, never> =>
  Scope.close(scope, Exit.void)

export const runInChildScope = <A, E>(
  parent: Scope.Scope,
  effect: Effect.Effect<A, E, Scope.Scope>,
): Effect.Effect<{ readonly value: A; readonly scope: Scope.CloseableScope }, E, never> =>
  Effect.gen(function* () {
    const child = yield* forkChildScope(parent)
    const value = yield* Scope.extend(effect, child)
    return { value, scope: child }
  })
