import { ManagedRuntime } from 'effect'
import { RepositoriesLive } from '~/repositories'

export const runtime = ManagedRuntime.make(RepositoriesLive)

export const runPromise = runtime.runPromise
export const runFork = runtime.runFork
