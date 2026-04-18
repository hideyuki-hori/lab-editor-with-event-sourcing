import { Context, type Effect } from 'effect'

export class SubscribePagesChanged extends Context.Tag('@usecase/subscribe-pages-changed')<
  SubscribePagesChanged,
  (handler: () => void) => Effect.Effect<() => void>
>() {}
