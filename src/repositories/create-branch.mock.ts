import { Effect, Layer } from 'effect'
import { NotFoundError } from '~/domain/errors'
import type { Branch } from '~/domain/schema/branch'
import { CreateBranch } from '~/domain/usecase/create-branch'
import {
  mockBranches,
  mockBranchesByStream,
  mockEvents,
  mockPagesChangedEmitter,
} from '~/repositories/mock-store'

export const CreateBranchMock = Layer.succeed(
  CreateBranch,
  (streamId, parentBranchId, forkVersion, name) =>
    Effect.gen(function* () {
      const parent = mockBranches.get(parentBranchId)
      if (!parent) {
        return yield* Effect.fail(new NotFoundError({ entity: 'Branch', id: parentBranchId }))
      }
      const id = crypto.randomUUID()
      const branch: Branch = {
        id,
        streamId: streamId,
        name: name ?? null,
        parentBranchId: parentBranchId,
        forkVersion: forkVersion,
        createdAt: Date.now(),
      }
      mockBranches.set(id, branch)
      const list = mockBranchesByStream.get(streamId) ?? []
      mockBranchesByStream.set(streamId, [...list, id])
      const parentEvents = (mockEvents.get(parentBranchId) ?? []).filter(
        (e) => e.version <= forkVersion,
      )
      mockEvents.set(id, [...parentEvents])
      mockPagesChangedEmitter.emit()
      return branch
    }),
)
