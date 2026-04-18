import { Schema } from 'effect'

export const Page = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  activeBranchId: Schema.String,
  updatedAt: Schema.Number,
})
export type Page = typeof Page.Type
