import { Context, type Effect } from 'effect'
import type { Branch } from '~/editor/schema/branch'
import type { DecodeError } from '~/errors/decode-error'
import type { InvokeError } from '~/errors/invoke-error'

export class CreateBranch extends Context.Tag('@repositories/create-branch')<
  CreateBranch,
  (
    streamId: string,
    parentBranchId: string,
    forkVersion: number,
    name?: string,
  ) => Effect.Effect<Branch, InvokeError | DecodeError>
>() {}
