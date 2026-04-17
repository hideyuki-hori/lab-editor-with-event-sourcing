import { Schema } from 'effect'
import { Page } from '~/app/schema/page'
import { Branch } from '~/editor/schema/branch'
import { StoredEvent } from '~/editor/schema/stored-event'
import { StoredSnapshot } from '~/editor/schema/stored-snapshot'

export const LoadedPage = Schema.Struct({
  page: Page,
  branch: Branch,
  snapshot: Schema.NullOr(StoredSnapshot),
  events: Schema.Array(StoredEvent),
})
export type LoadedPage = typeof LoadedPage.Type
