import { Context, type Effect } from 'effect'
import type { Branch } from '~/editor/schema/branch'
import type { DecodeError } from '~/errors/decode-error'
import type { InvokeError } from '~/errors/invoke-error'

export class ListBranches extends Context.Tag('@repositories/list-branches')<
  ListBranches,
  (streamId: string) => Effect.Effect<readonly Branch[], InvokeError | DecodeError>
>() {}
