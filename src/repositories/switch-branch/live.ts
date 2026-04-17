import { Effect, Layer } from 'effect'
import { LoadedPage } from '~/editor/schema/loaded-page'
import { decodeWith } from '~/lib/decode-with'
import { invokeTauri } from '~/lib/invoke-tauri'
import { SwitchBranch } from '~/repositories/switch-branch/tag'

export const SwitchBranchLive = Layer.succeed(SwitchBranch, (streamId, branchId) =>
  invokeTauri<unknown>('switch_branch', { streamId, branchId }).pipe(
    Effect.flatMap(decodeWith(LoadedPage, 'switch_branch')),
  ),
)
