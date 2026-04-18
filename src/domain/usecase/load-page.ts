import { Context, type Effect } from 'effect'
import type { NotFoundError, RepositoryError } from '~/domain/errors'
import type { LoadedPage } from '~/domain/schema/loaded-page'

export class LoadPage extends Context.Tag('@usecase/load-page')<
  LoadPage,
  (id: string) => Effect.Effect<LoadedPage, NotFoundError | RepositoryError>
>() {}
