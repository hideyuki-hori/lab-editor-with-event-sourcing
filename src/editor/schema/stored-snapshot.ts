import { Schema } from 'effect'

export const StoredSnapshot = Schema.Struct({
  branch_id: Schema.String,
  version: Schema.Number,
  state: Schema.String,
  created_at: Schema.Number,
})
export type StoredSnapshot = typeof StoredSnapshot.Type
