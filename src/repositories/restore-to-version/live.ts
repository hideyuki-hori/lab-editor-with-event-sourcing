import { Effect, Layer } from 'effect'
import { RestoreResult } from '~/editor/schema/restore-result'
import { decodeWith } from '~/lib/decode-with'
import { invokeTauri } from '~/lib/invoke-tauri'
import { RestoreToVersion } from '~/repositories/restore-to-version/tag'

export const RestoreToVersionLive = Layer.succeed(RestoreToVersion, (branchId, targetVersion) =>
  invokeTauri<unknown>('restore_to_version', { branchId, targetVersion }).pipe(
    Effect.flatMap(decodeWith(RestoreResult, 'restore_to_version')),
  ),
)
