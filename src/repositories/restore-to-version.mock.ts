import { Effect, Layer } from 'effect'
import { NotFoundError } from '~/domain/errors'
import type { RestoreResult } from '~/domain/schema/restore-result'
import { RestoreToVersion } from '~/domain/usecase/restore-to-version'
import { mockBranches, mockEvents, mockSnapshots } from '~/repositories/mock-store'

export const RestoreToVersionMock = Layer.succeed(RestoreToVersion, (branchId, targetVersion) =>
  Effect.gen(function* () {
    if (!mockBranches.has(branchId)) {
      return yield* Effect.fail(new NotFoundError({ entity: 'Branch', id: branchId }))
    }
    const allEvents = mockEvents.get(branchId) ?? []
    const snapshot = mockSnapshots.get(branchId)
    const applicableSnapshot = snapshot && snapshot.version <= targetVersion ? snapshot : null
    const baseVersion = applicableSnapshot?.version ?? 0
    const events = allEvents.filter((e) => e.version > baseVersion && e.version <= targetVersion)
    const result: RestoreResult = {
      branchId: branchId,
      targetVersion: targetVersion,
      snapshot: applicableSnapshot,
      events,
    }
    return result
  }),
)
