import { Schema } from 'effect'
import { StoredEvent } from '~/domain/schema/stored-event'
import { StoredSnapshot } from '~/domain/schema/stored-snapshot'

export const RestoreResult = Schema.Struct({
  branchId: Schema.String,
  targetVersion: Schema.Number,
  snapshot: Schema.NullOr(StoredSnapshot),
  events: Schema.Array(StoredEvent),
})
export type RestoreResult = typeof RestoreResult.Type
