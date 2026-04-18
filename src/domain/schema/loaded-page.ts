import { Schema } from 'effect'
import { Branch } from '~/domain/schema/branch'
import { Page } from '~/domain/schema/page'
import { StoredEvent } from '~/domain/schema/stored-event'
import { StoredSnapshot } from '~/domain/schema/stored-snapshot'

export const LoadedPage = Schema.Struct({
  page: Page,
  branch: Branch,
  snapshot: Schema.NullOr(StoredSnapshot),
  events: Schema.Array(StoredEvent),
})
export type LoadedPage = typeof LoadedPage.Type
