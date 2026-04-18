import { Context, type Effect } from 'effect'
import type { RepositoryError } from '~/domain/errors'
import type { Branch } from '~/domain/schema/branch'

export class ListBranches extends Context.Tag('@usecase/list-branches')<
  ListBranches,
  (streamId: string) => Effect.Effect<readonly Branch[], RepositoryError>
>() {}
