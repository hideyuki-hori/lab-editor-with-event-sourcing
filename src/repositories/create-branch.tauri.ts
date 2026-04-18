import { Effect, Layer } from 'effect'
import { Branch } from '~/domain/schema/branch'
import { CreateBranch } from '~/domain/usecase/create-branch'
import { decodeWith } from '~/repositories/decode-with'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toNotFoundOrRepositoryError } from '~/repositories/tauri-error'

export const CreateBranchTauri = Layer.succeed(
  CreateBranch,
  (streamId, parentBranchId, forkVersion, name) =>
    invokeTauri<unknown>('create_branch', {
      streamId,
      parentBranchId,
      forkVersion,
      name,
    }).pipe(
      Effect.flatMap(decodeWith(Branch, 'create_branch')),
      Effect.mapError(toNotFoundOrRepositoryError('create_branch', 'Branch', parentBranchId)),
    ),
)
