import { Layer } from 'effect'
import { AppendEventsTauri } from '~/repositories/append-events.tauri'
import { CreateBranchTauri } from '~/repositories/create-branch.tauri'
import { CreatePageTauri } from '~/repositories/create-page.tauri'
import { ListBranchesTauri } from '~/repositories/list-branches.tauri'
import { ListPagesTauri } from '~/repositories/list-pages.tauri'
import { LoadPageTauri } from '~/repositories/load-page.tauri'
import { RestoreToVersionTauri } from '~/repositories/restore-to-version.tauri'
import { SaveSnapshotTauri } from '~/repositories/save-snapshot.tauri'
import { SubscribePagesChangedTauri } from '~/repositories/subscribe-pages-changed.tauri'
import { SubscribeStepsAppliedTauri } from '~/repositories/subscribe-steps-applied.tauri'
import { SwitchBranchTauri } from '~/repositories/switch-branch.tauri'

export const TauriLive = Layer.mergeAll(
  AppendEventsTauri,
  CreateBranchTauri,
  CreatePageTauri,
  ListBranchesTauri,
  ListPagesTauri,
  LoadPageTauri,
  RestoreToVersionTauri,
  SaveSnapshotTauri,
  SubscribePagesChangedTauri,
  SubscribeStepsAppliedTauri,
  SwitchBranchTauri,
)
