import { Context, type Effect } from 'effect'
import type { RepositoryError } from '~/domain/errors'
import type { Page } from '~/domain/schema/page'

export class ListPages extends Context.Tag('@usecase/list-pages')<
  ListPages,
  () => Effect.Effect<readonly Page[], RepositoryError>
>() {}
