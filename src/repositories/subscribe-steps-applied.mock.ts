import { Effect, Layer } from 'effect'
import { SubscribeStepsApplied } from '~/domain/usecase/subscribe-steps-applied'
import { mockStepsAppliedEmitter } from '~/repositories/mock-store'

export const SubscribeStepsAppliedMock = Layer.succeed(SubscribeStepsApplied, (handler) =>
  Effect.sync(() => mockStepsAppliedEmitter.on(handler)),
)
