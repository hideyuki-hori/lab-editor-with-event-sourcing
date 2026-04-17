import { Schema } from 'effect'

export const EventInput = Schema.Struct({
  kind: Schema.String,
  payload: Schema.String,
})
export type EventInput = typeof EventInput.Type
