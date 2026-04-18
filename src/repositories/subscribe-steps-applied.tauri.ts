import { listen } from '@tauri-apps/api/event'
import { Effect, Layer } from 'effect'
import type { StepsAppliedPayload } from '~/domain/schema/steps-applied-payload'
import { SubscribeStepsApplied } from '~/domain/usecase/subscribe-steps-applied'

export const SubscribeStepsAppliedTauri = Layer.succeed(SubscribeStepsApplied, (handler) =>
  Effect.promise(() => listen<StepsAppliedPayload>('steps_applied', (e) => handler(e.payload))),
)
