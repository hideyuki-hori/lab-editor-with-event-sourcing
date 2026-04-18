import type { Layer } from 'effect'
import { ManagedRuntime } from 'effect'
import { RepositoriesLive } from '~/adapters/repositories-live'

export const AppLayer = RepositoriesLive

export type AppRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Layer.Success<typeof AppLayer>,
  Layer.Layer.Error<typeof AppLayer>
>

export const makeRuntime = (): AppRuntime => ManagedRuntime.make(AppLayer)
