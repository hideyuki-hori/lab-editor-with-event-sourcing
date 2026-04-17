import { Layer } from 'effect'
import { invokeTauri } from '~/lib/invoke-tauri'
import { AppendEvents } from '~/repositories/append-events/tag'

export const AppendEventsLive = Layer.succeed(
  AppendEvents,
  (pageId, branchId, expectedVersion, events, title) =>
    invokeTauri<number>('append_events', {
      pageId,
      branchId,
      expectedVersion,
      events,
      title,
    }),
)
