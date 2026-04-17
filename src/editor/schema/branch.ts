import { Schema } from 'effect'

export const Branch = Schema.Struct({
  id: Schema.String,
  stream_id: Schema.String,
  name: Schema.NullOr(Schema.String),
  parent_branch_id: Schema.NullOr(Schema.String),
  fork_version: Schema.NullOr(Schema.Number),
  created_at: Schema.Number,
})
export type Branch = typeof Branch.Type
