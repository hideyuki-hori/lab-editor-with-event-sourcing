import { Schema } from 'effect'

export const StepsAppliedPayload = Schema.Struct({
  streamId: Schema.String,
  branchId: Schema.String,
  version: Schema.Number,
})
export type StepsAppliedPayload = typeof StepsAppliedPayload.Type
