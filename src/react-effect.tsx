import type { Effect, Layer } from 'effect'
import { createContext, type ReactNode, useCallback, useContext } from 'react'
import type { AppLayer, AppRuntime } from '~/runtime'

type AppR = Layer.Layer.Success<typeof AppLayer>

const RuntimeContext = createContext<AppRuntime | null>(null)

type Props = {
  runtime: AppRuntime
  children: ReactNode
}

export function RuntimeProvider({ runtime, children }: Props) {
  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>
}

export function useRuntime(): AppRuntime {
  const rt = useContext(RuntimeContext)
  if (!rt) throw new Error('RuntimeProvider is not mounted')
  return rt
}

export function useRunPromise() {
  const runtime = useRuntime()
  return useCallback(
    <A, E>(effect: Effect.Effect<A, E, AppR>) => runtime.runPromise(effect),
    [runtime],
  )
}

export function useRunFork() {
  const runtime = useRuntime()
  return useCallback(
    <A, E>(effect: Effect.Effect<A, E, AppR>) => runtime.runFork(effect),
    [runtime],
  )
}
