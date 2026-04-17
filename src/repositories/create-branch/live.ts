import { Effect, Layer } from 'effect'
import { Branch } from '~/editor/schema/branch'
import { decodeWith } from '~/lib/decode-with'
import { invokeTauri } from '~/lib/invoke-tauri'
import { CreateBranch } from '~/repositories/create-branch/tag'

export const CreateBranchLive = Layer.succeed(
  CreateBranch,
  (streamId, parentBranchId, forkVersion, name) =>
    invokeTauri<unknown>('create_branch', {
      streamId,
      parentBranchId,
      forkVersion,
      name,
    }).pipe(Effect.flatMap(decodeWith(Branch, 'create_branch'))),
)
