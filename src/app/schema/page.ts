import { Schema } from 'effect'

export const Page = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  active_branch_id: Schema.String,
  updated_at: Schema.Number,
})
export type Page = typeof Page.Type
