import { Effect, Layer } from 'effect'
import type { Branch } from '~/domain/schema/branch'
import type { Page } from '~/domain/schema/page'
import { CreatePage } from '~/domain/usecase/create-page'
import {
  mockBranches,
  mockBranchesByStream,
  mockEvents,
  mockPages,
  mockPagesChangedEmitter,
} from '~/repositories/mock-store'

export const CreatePageMock = Layer.succeed(CreatePage, (title?: string) =>
  Effect.sync((): Page => {
    const id = crypto.randomUUID()
    const branchId = crypto.randomUUID()
    const now = Date.now()
    const page: Page = {
      id,
      title: title ?? 'Untitled',
      activeBranchId: branchId,
      updatedAt: now,
    }
    const branch: Branch = {
      id: branchId,
      streamId: id,
      name: 'main',
      parentBranchId: null,
      forkVersion: null,
      createdAt: now,
    }
    mockPages.set(id, page)
    mockBranches.set(branchId, branch)
    mockBranchesByStream.set(id, [branchId])
    mockEvents.set(branchId, [])
    mockPagesChangedEmitter.emit()
    return page
  }),
)
