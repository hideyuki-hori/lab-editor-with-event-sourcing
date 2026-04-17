import { Effect, Layer } from 'effect'
import type { Branch } from '~/editor/schema/branch'
import { CreateBranch } from '~/repositories/create-branch/tag'
import { mockBranches, mockBranchesByStream, mockEvents } from '~/repositories/mock/store'

export const CreateBranchMock = Layer.succeed(
  CreateBranch,
  (streamId, parentBranchId, forkVersion, name) =>
    Effect.sync((): Branch => {
      const id = crypto.randomUUID()
      const branch: Branch = {
        id,
        stream_id: streamId,
        name: name ?? null,
        parent_branch_id: parentBranchId,
        fork_version: forkVersion,
        created_at: Date.now(),
      }
      mockBranches.set(id, branch)
      const list = mockBranchesByStream.get(streamId) ?? []
      mockBranchesByStream.set(streamId, [...list, id])
      const parentEvents = (mockEvents.get(parentBranchId) ?? []).filter(
        (e) => e.version <= forkVersion,
      )
      mockEvents.set(id, [...parentEvents])
      return branch
    }),
)
