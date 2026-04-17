import { Layer } from 'effect'
import { invokeTauri } from '~/lib/invoke-tauri'
import { SaveSnapshot } from '~/repositories/save-snapshot/tag'

export const SaveSnapshotLive = Layer.succeed(SaveSnapshot, (branchId, version, state) =>
  invokeTauri<void>('save_snapshot', {
    branchId,
    version,
    state: JSON.stringify(state),
  }),
)
