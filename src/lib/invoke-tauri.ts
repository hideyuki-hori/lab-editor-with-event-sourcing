import { invoke } from '@tauri-apps/api/core'
import { Effect } from 'effect'
import { InvokeError } from '~/errors/invoke-error'

export const invokeTauri = <A>(command: string, args?: Record<string, unknown>) =>
  Effect.tryPromise({
    try: () => invoke<A>(command, args),
    catch: (cause) => new InvokeError({ command, cause }),
  })
