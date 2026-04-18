import { Layer } from 'effect'
import { AppendEventsMock } from '~/repositories/append-events.mock'
import { CreateBranchMock } from '~/repositories/create-branch.mock'
import { CreatePageMock } from '~/repositories/create-page.mock'
import { ListBranchesMock } from '~/repositories/list-branches.mock'
import { ListPagesMock } from '~/repositories/list-pages.mock'
import { LoadPageMock } from '~/repositories/load-page.mock'
import { RestoreToVersionMock } from '~/repositories/restore-to-version.mock'
import { SaveSnapshotMock } from '~/repositories/save-snapshot.mock'
import { SubscribePagesChangedMock } from '~/repositories/subscribe-pages-changed.mock'
import { SubscribeStepsAppliedMock } from '~/repositories/subscribe-steps-applied.mock'
import { SwitchBranchMock } from '~/repositories/switch-branch.mock'

export const MockLive = Layer.mergeAll(
  AppendEventsMock,
  CreateBranchMock,
  CreatePageMock,
  ListBranchesMock,
  ListPagesMock,
  LoadPageMock,
  RestoreToVersionMock,
  SaveSnapshotMock,
  SubscribePagesChangedMock,
  SubscribeStepsAppliedMock,
  SwitchBranchMock,
)
