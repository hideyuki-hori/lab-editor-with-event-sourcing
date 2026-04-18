import { Context, type Effect } from 'effect'
import type { RepositoryError } from '~/domain/errors'
import type { Page } from '~/domain/schema/page'

export class CreatePage extends Context.Tag('@usecase/create-page')<
  CreatePage,
  (title?: string) => Effect.Effect<Page, RepositoryError>
>() {}
