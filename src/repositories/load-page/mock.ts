import { Effect, Layer } from 'effect'
import type { LoadedPage } from '~/editor/schema/loaded-page'
import { LoadPage } from '~/repositories/load-page/tag'
import { mockBranches, mockEvents, mockPages, mockSnapshots } from '~/repositories/mock/store'

export const LoadPageMock = Layer.succeed(LoadPage, (id: string) =>
  Effect.gen(function* () {
    const page = mockPages.get(id)
    if (!page) return yield* Effect.die(`page not found: ${id}`)
    const branch = mockBranches.get(page.active_branch_id)
    if (!branch) return yield* Effect.die(`branch not found: ${page.active_branch_id}`)
    const loadedPage: LoadedPage = {
      page,
      branch,
      events: mockEvents.get(branch.id) ?? [],
      snapshot: mockSnapshots.get(branch.id) ?? null,
    }
    return loadedPage
  }),
)
