import { Effect, Layer } from 'effect'
import { RestoreResult } from '~/domain/schema/restore-result'
import { RestoreToVersion } from '~/domain/usecase/restore-to-version'
import { decodeWith } from '~/repositories/decode-with'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toNotFoundOrRepositoryError } from '~/repositories/tauri-error'

export const RestoreToVersionTauri = Layer.succeed(RestoreToVersion, (branchId, targetVersion) =>
  invokeTauri<unknown>('restore_to_version', { branchId, targetVersion }).pipe(
    Effect.flatMap(decodeWith(RestoreResult, 'restore_to_version')),
    Effect.mapError(toNotFoundOrRepositoryError('restore_to_version', 'Branch', branchId)),
  ),
)
