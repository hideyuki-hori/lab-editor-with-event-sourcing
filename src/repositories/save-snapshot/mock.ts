import { Effect, Layer } from 'effect'
import { mockSnapshots } from '~/repositories/mock/store'
import { SaveSnapshot } from '~/repositories/save-snapshot/tag'

export const SaveSnapshotMock = Layer.succeed(SaveSnapshot, (branchId, version, state) =>
  Effect.sync(() => {
    mockSnapshots.set(branchId, {
      branch_id: branchId,
      version,
      state: JSON.stringify(state),
      created_at: Date.now(),
    })
  }),
)
