import { Context, type Effect } from 'effect'
import type { LoadedPage } from '~/editor/schema/loaded-page'
import type { DecodeError } from '~/errors/decode-error'
import type { InvokeError } from '~/errors/invoke-error'

export class SwitchBranch extends Context.Tag('@repositories/switch-branch')<
  SwitchBranch,
  (streamId: string, branchId: string) => Effect.Effect<LoadedPage, InvokeError | DecodeError>
>() {}
