import { Schema } from 'effect'

export const Branch = Schema.Struct({
  id: Schema.String,
  streamId: Schema.String,
  name: Schema.NullOr(Schema.String),
  parentBranchId: Schema.NullOr(Schema.String),
  forkVersion: Schema.NullOr(Schema.Number),
  createdAt: Schema.Number,
})
export type Branch = typeof Branch.Type
