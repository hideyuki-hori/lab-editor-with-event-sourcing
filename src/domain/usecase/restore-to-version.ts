import { Context, type Effect } from 'effect'
import type { NotFoundError, RepositoryError } from '~/domain/errors'
import type { RestoreResult } from '~/domain/schema/restore-result'

export class RestoreToVersion extends Context.Tag('@usecase/restore-to-version')<
  RestoreToVersion,
  (
    branchId: string,
    targetVersion: number,
  ) => Effect.Effect<RestoreResult, NotFoundError | RepositoryError>
>() {}
