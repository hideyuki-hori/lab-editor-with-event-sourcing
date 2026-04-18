import { Context, type Effect } from 'effect'
import type { NotFoundError, RepositoryError } from '~/domain/errors'
import type { Branch } from '~/domain/schema/branch'

export class CreateBranch extends Context.Tag('@usecase/create-branch')<
  CreateBranch,
  (
    streamId: string,
    parentBranchId: string,
    forkVersion: number,
    name?: string,
  ) => Effect.Effect<Branch, NotFoundError | RepositoryError>
>() {}
