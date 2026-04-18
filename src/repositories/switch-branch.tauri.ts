import { Effect, Layer } from 'effect'
import { LoadedPage } from '~/domain/schema/loaded-page'
import { SwitchBranch } from '~/domain/usecase/switch-branch'
import { decodeWith } from '~/repositories/decode-with'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toNotFoundOrRepositoryError } from '~/repositories/tauri-error'

export const SwitchBranchTauri = Layer.succeed(SwitchBranch, (streamId, branchId) =>
  invokeTauri<unknown>('switch_branch', { streamId, branchId }).pipe(
    Effect.flatMap(decodeWith(LoadedPage, 'switch_branch')),
    Effect.mapError(toNotFoundOrRepositoryError('switch_branch', 'Branch', branchId)),
  ),
)
