import { Effect, Layer } from 'effect'
import type { RestoreResult } from '~/editor/schema/restore-result'
import { mockEvents, mockSnapshots } from '~/repositories/mock/store'
import { RestoreToVersion } from '~/repositories/restore-to-version/tag'

export const RestoreToVersionMock = Layer.succeed(RestoreToVersion, (branchId, targetVersion) =>
  Effect.sync((): RestoreResult => {
    const allEvents = mockEvents.get(branchId) ?? []
    const snapshot = mockSnapshots.get(branchId)
    const applicableSnapshot = snapshot && snapshot.version <= targetVersion ? snapshot : null
    const baseVersion = applicableSnapshot?.version ?? 0
    const events = allEvents.filter((e) => e.version > baseVersion && e.version <= targetVersion)
    return {
      branch_id: branchId,
      target_version: targetVersion,
      snapshot: applicableSnapshot,
      events,
    }
  }),
)
