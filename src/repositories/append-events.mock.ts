import { Effect, Layer } from 'effect'
import { VersionConflictError } from '~/domain/errors'
import type { StoredEvent } from '~/domain/schema/stored-event'
import { AppendEvents } from '~/domain/usecase/append-events'
import {
  mockEvents,
  mockPages,
  mockPagesChangedEmitter,
  mockStepsAppliedEmitter,
  nextSequence,
} from '~/repositories/mock-store'

export const AppendEventsMock = Layer.succeed(
  AppendEvents,
  (pageId, branchId, expectedVersion, events, title) =>
    Effect.gen(function* () {
      const current = mockEvents.get(branchId) ?? []
      const actual = current.length > 0 ? current[current.length - 1].version : 0
      if (actual !== expectedVersion) {
        return yield* Effect.fail(new VersionConflictError({ expected: expectedVersion, actual }))
      }
      const now = Date.now()
      const newEvents: StoredEvent[] = events.map((e, i) => ({
        sequenceId: nextSequence(),
        streamId: pageId,
        branchId: branchId,
        kind: e.kind,
        payload: e.payload,
        version: expectedVersion + i + 1,
        createdAt: now,
      }))
      mockEvents.set(branchId, [...current, ...newEvents])
      if (title !== undefined) {
        const page = mockPages.get(pageId)
        if (page) mockPages.set(pageId, { ...page, title, updatedAt: now })
      }
      const newVersion = expectedVersion + events.length
      mockStepsAppliedEmitter.emit({
        streamId: pageId,
        branchId: branchId,
        version: newVersion,
      })
      mockPagesChangedEmitter.emit()
      return newVersion
    }),
)
