import { Effect, Layer } from 'effect'
import { NotFoundError } from '~/domain/errors'
import type { LoadedPage } from '~/domain/schema/loaded-page'
import { SwitchBranch } from '~/domain/usecase/switch-branch'
import {
  mockBranches,
  mockEvents,
  mockPages,
  mockPagesChangedEmitter,
  mockSnapshots,
} from '~/repositories/mock-store'

export const SwitchBranchMock = Layer.succeed(SwitchBranch, (streamId, branchId) =>
  Effect.gen(function* () {
    const current = mockPages.get(streamId)
    if (!current) {
      return yield* Effect.fail(new NotFoundError({ entity: 'Page', id: streamId }))
    }
    const branch = mockBranches.get(branchId)
    if (!branch) {
      return yield* Effect.fail(new NotFoundError({ entity: 'Branch', id: branchId }))
    }
    const page = { ...current, activeBranchId: branchId }
    mockPages.set(streamId, page)
    const loadedPage: LoadedPage = {
      page,
      branch,
      events: mockEvents.get(branchId) ?? [],
      snapshot: mockSnapshots.get(branchId) ?? null,
    }
    mockPagesChangedEmitter.emit()
    return loadedPage
  }),
)
