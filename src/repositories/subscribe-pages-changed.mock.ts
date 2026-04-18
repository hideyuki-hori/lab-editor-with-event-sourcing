import { Effect, Layer } from 'effect'
import { SubscribePagesChanged } from '~/domain/usecase/subscribe-pages-changed'
import { mockPagesChangedEmitter } from '~/repositories/mock-store'

export const SubscribePagesChangedMock = Layer.succeed(SubscribePagesChanged, (handler) =>
  Effect.sync(() => mockPagesChangedEmitter.on(() => handler())),
)
