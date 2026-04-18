import { Context, type Effect } from 'effect'
import type { StepsAppliedPayload } from '~/domain/schema/steps-applied-payload'

export class SubscribeStepsApplied extends Context.Tag('@usecase/subscribe-steps-applied')<
  SubscribeStepsApplied,
  (handler: (payload: StepsAppliedPayload) => void) => Effect.Effect<() => void>
>() {}
