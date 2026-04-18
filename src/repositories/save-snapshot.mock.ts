import { Effect, Layer } from 'effect'
import { SaveSnapshot } from '~/domain/usecase/save-snapshot'
import { mockSnapshots } from '~/repositories/mock-store'

export const SaveSnapshotMock = Layer.succeed(SaveSnapshot, (branchId, version, state) =>
  Effect.sync(() => {
    mockSnapshots.set(branchId, {
      branchId: branchId,
      version,
      state: JSON.stringify(state),
      createdAt: Date.now(),
    })
  }),
)
