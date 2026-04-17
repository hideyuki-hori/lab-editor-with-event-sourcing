import { Schema } from 'effect'
import { StoredEvent } from '~/editor/schema/stored-event'
import { StoredSnapshot } from '~/editor/schema/stored-snapshot'

export const RestoreResult = Schema.Struct({
  branch_id: Schema.String,
  target_version: Schema.Number,
  snapshot: Schema.NullOr(StoredSnapshot),
  events: Schema.Array(StoredEvent),
})
export type RestoreResult = typeof RestoreResult.Type
