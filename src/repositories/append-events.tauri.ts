import { Effect, Layer } from 'effect'
import { AppendEvents } from '~/domain/usecase/append-events'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toAppendEventsError } from '~/repositories/tauri-error'

export const AppendEventsTauri = Layer.succeed(
  AppendEvents,
  (pageId, branchId, expectedVersion, events, title) =>
    invokeTauri<number>('append_events', {
      pageId,
      branchId,
      expectedVersion,
      events,
      title,
    }).pipe(Effect.mapError(toAppendEventsError)),
)
