import { Schema } from 'effect'

export const StoredEvent = Schema.Struct({
  sequence_id: Schema.Number,
  stream_id: Schema.String,
  branch_id: Schema.String,
  kind: Schema.String,
  payload: Schema.String,
  version: Schema.Number,
  created_at: Schema.Number,
})
export type StoredEvent = typeof StoredEvent.Type
