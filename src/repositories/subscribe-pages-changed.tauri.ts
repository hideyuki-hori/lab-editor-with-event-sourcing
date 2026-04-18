import { listen } from '@tauri-apps/api/event'
import { Effect, Layer } from 'effect'
import { SubscribePagesChanged } from '~/domain/usecase/subscribe-pages-changed'

export const SubscribePagesChangedTauri = Layer.succeed(SubscribePagesChanged, (handler) =>
  Effect.promise(() => listen('pages_changed', () => handler())),
)
