import { Effect, Layer, Schema } from 'effect'
import { Branch } from '~/editor/schema/branch'
import { decodeWith } from '~/lib/decode-with'
import { invokeTauri } from '~/lib/invoke-tauri'
import { ListBranches } from '~/repositories/list-branches/tag'

export const ListBranchesLive = Layer.succeed(ListBranches, (streamId: string) =>
  invokeTauri<unknown>('list_branches', { streamId }).pipe(
    Effect.flatMap(decodeWith(Schema.Array(Branch), 'list_branches')),
  ),
)
