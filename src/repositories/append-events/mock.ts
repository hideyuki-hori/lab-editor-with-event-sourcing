import { Effect, Layer } from 'effect'
import type { StoredEvent } from '~/editor/schema/stored-event'
import { AppendEvents } from '~/repositories/append-events/tag'
import { mockEvents, mockPages, nextSequence } from '~/repositories/mock/store'

export const AppendEventsMock = Layer.succeed(
  AppendEvents,
  (pageId, branchId, expectedVersion, events, title) =>
    Effect.sync((): number => {
      const current = mockEvents.get(branchId) ?? []
      const newEvents: StoredEvent[] = events.map((e, i) => ({
        sequence_id: nextSequence(),
        stream_id: pageId,
        branch_id: branchId,
        kind: e.kind,
        payload: e.payload,
        version: expectedVersion + i + 1,
        created_at: Date.now(),
      }))
      mockEvents.set(branchId, [...current, ...newEvents])
      if (title !== undefined) {
        const page = mockPages.get(pageId)
        if (page) mockPages.set(pageId, { ...page, title, updated_at: Date.now() })
      }
      return expectedVersion + events.length
    }),
)
