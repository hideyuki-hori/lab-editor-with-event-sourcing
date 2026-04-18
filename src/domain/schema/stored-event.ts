import { Schema } from 'effect'

export const StoredEvent = Schema.Struct({
  sequenceId: Schema.Number,
  streamId: Schema.String,
  branchId: Schema.String,
  kind: Schema.String,
  payload: Schema.String,
  version: Schema.Number,
  createdAt: Schema.Number,
})
export type StoredEvent = typeof StoredEvent.Type
