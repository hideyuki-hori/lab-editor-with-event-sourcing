import { Effect, Layer } from 'effect'
import { NotFoundError } from '~/domain/errors'
import type { LoadedPage } from '~/domain/schema/loaded-page'
import { LoadPage } from '~/domain/usecase/load-page'
import { mockBranches, mockEvents, mockPages, mockSnapshots } from '~/repositories/mock-store'

export const LoadPageMock = Layer.succeed(LoadPage, (id: string) =>
  Effect.gen(function* () {
    const page = mockPages.get(id)
    if (!page) return yield* Effect.fail(new NotFoundError({ entity: 'Page', id }))
    const branch = mockBranches.get(page.activeBranchId)
    if (!branch) {
      return yield* Effect.fail(new NotFoundError({ entity: 'Branch', id: page.activeBranchId }))
    }
    const loadedPage: LoadedPage = {
      page,
      branch,
      events: mockEvents.get(branch.id) ?? [],
      snapshot: mockSnapshots.get(branch.id) ?? null,
    }
    return loadedPage
  }),
)
