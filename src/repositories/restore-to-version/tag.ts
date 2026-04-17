import { Context, type Effect } from 'effect'
import type { RestoreResult } from '~/editor/schema/restore-result'
import type { DecodeError } from '~/errors/decode-error'
import type { InvokeError } from '~/errors/invoke-error'

export class RestoreToVersion extends Context.Tag('@repositories/restore-to-version')<
  RestoreToVersion,
  (
    branchId: string,
    targetVersion: number,
  ) => Effect.Effect<RestoreResult, InvokeError | DecodeError>
>() {}
