import { Effect, Layer } from 'effect'
import type { LoadedPage } from '~/editor/schema/loaded-page'
import { mockBranches, mockEvents, mockPages, mockSnapshots } from '~/repositories/mock/store'
import { SwitchBranch } from '~/repositories/switch-branch/tag'

export const SwitchBranchMock = Layer.succeed(SwitchBranch, (streamId, branchId) =>
  Effect.gen(function* () {
    const current = mockPages.get(streamId)
    if (!current) return yield* Effect.die(`page not found: ${streamId}`)
    const branch = mockBranches.get(branchId)
    if (!branch) return yield* Effect.die(`branch not found: ${branchId}`)
    const page = { ...current, active_branch_id: branchId }
    mockPages.set(streamId, page)
    const loadedPage: LoadedPage = {
      page,
      branch,
      events: mockEvents.get(branchId) ?? [],
      snapshot: mockSnapshots.get(branchId) ?? null,
    }
    return loadedPage
  }),
)
