import { Effect, Layer, Schema } from 'effect'
import { Branch } from '~/domain/schema/branch'
import { ListBranches } from '~/domain/usecase/list-branches'
import { decodeWith } from '~/repositories/decode-with'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toRepositoryError } from '~/repositories/tauri-error'

export const ListBranchesTauri = Layer.succeed(ListBranches, (streamId: string) =>
  invokeTauri<unknown>('list_branches', { streamId }).pipe(
    Effect.flatMap(decodeWith(Schema.Array(Branch), 'list_branches')),
    Effect.mapError(toRepositoryError('list_branches')),
  ),
)
