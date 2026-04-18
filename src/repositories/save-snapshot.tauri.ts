import { Effect, Layer } from 'effect'
import { SaveSnapshot } from '~/domain/usecase/save-snapshot'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toRepositoryError } from '~/repositories/tauri-error'

export const SaveSnapshotTauri = Layer.succeed(SaveSnapshot, (branchId, version, state) =>
  invokeTauri<void>('save_snapshot', {
    branchId,
    version,
    state: JSON.stringify(state),
  }).pipe(Effect.mapError(toRepositoryError('save_snapshot'))),
)
