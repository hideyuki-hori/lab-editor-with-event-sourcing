import { Effect, Layer } from 'effect'
import type { Page } from '~/app/schema/page'
import type { Branch } from '~/editor/schema/branch'
import { CreatePage } from '~/repositories/create-page/tag'
import {
  mockBranches,
  mockBranchesByStream,
  mockEvents,
  mockPages,
} from '~/repositories/mock/store'

export const CreatePageMock = Layer.succeed(CreatePage, (title?: string) =>
  Effect.sync((): Page => {
    const id = crypto.randomUUID()
    const branchId = crypto.randomUUID()
    const now = Date.now()
    const page: Page = {
      id,
      title: title ?? 'Untitled',
      active_branch_id: branchId,
      updated_at: now,
    }
    const branch: Branch = {
      id: branchId,
      stream_id: id,
      name: 'main',
      parent_branch_id: null,
      fork_version: null,
      created_at: now,
    }
    mockPages.set(id, page)
    mockBranches.set(branchId, branch)
    mockBranchesByStream.set(id, [branchId])
    mockEvents.set(branchId, [])
    return page
  }),
)
