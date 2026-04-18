import { Context, type Effect } from 'effect'
import type { NotFoundError, RepositoryError } from '~/domain/errors'
import type { LoadedPage } from '~/domain/schema/loaded-page'

export class SwitchBranch extends Context.Tag('@usecase/switch-branch')<
  SwitchBranch,
  (streamId: string, branchId: string) => Effect.Effect<LoadedPage, NotFoundError | RepositoryError>
>() {}
