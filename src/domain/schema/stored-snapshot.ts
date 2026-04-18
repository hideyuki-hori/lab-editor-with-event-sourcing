import { Schema } from 'effect'

export const StoredSnapshot = Schema.Struct({
  branchId: Schema.String,
  version: Schema.Number,
  state: Schema.String,
  createdAt: Schema.Number,
})
export type StoredSnapshot = typeof StoredSnapshot.Type
