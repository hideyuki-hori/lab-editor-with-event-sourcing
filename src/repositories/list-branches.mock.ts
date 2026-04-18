import { Effect, Layer } from 'effect'
import type { Branch } from '~/domain/schema/branch'
import { ListBranches } from '~/domain/usecase/list-branches'
import { mockBranches, mockBranchesByStream } from '~/repositories/mock-store'

export const ListBranchesMock = Layer.succeed(ListBranches, (streamId: string) =>
  Effect.sync((): readonly Branch[] => {
    const ids = mockBranchesByStream.get(streamId) ?? []
    return ids.map((id) => mockBranches.get(id)).filter((b): b is Branch => b !== undefined)
  }),
)
