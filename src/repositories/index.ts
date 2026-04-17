import { isTauri } from '@tauri-apps/api/core'
import { Layer } from 'effect'
import { AppendEventsLive } from '~/repositories/append-events/live'
import { AppendEventsMock } from '~/repositories/append-events/mock'
import { CreateBranchLive } from '~/repositories/create-branch/live'
import { CreateBranchMock } from '~/repositories/create-branch/mock'
import { CreatePageLive } from '~/repositories/create-page/live'
import { CreatePageMock } from '~/repositories/create-page/mock'
import { ListBranchesLive } from '~/repositories/list-branches/live'
import { ListBranchesMock } from '~/repositories/list-branches/mock'
import { ListPagesLive } from '~/repositories/list-pages/live'
import { ListPagesMock } from '~/repositories/list-pages/mock'
import { LoadPageLive } from '~/repositories/load-page/live'
import { LoadPageMock } from '~/repositories/load-page/mock'
import { RestoreToVersionLive } from '~/repositories/restore-to-version/live'
import { RestoreToVersionMock } from '~/repositories/restore-to-version/mock'
import { SaveSnapshotLive } from '~/repositories/save-snapshot/live'
import { SaveSnapshotMock } from '~/repositories/save-snapshot/mock'
import { SwitchBranchLive } from '~/repositories/switch-branch/live'
import { SwitchBranchMock } from '~/repositories/switch-branch/mock'

const useMock = !isTauri()

const live = Layer.mergeAll(
  AppendEventsLive,
  CreateBranchLive,
  CreatePageLive,
  ListBranchesLive,
  ListPagesLive,
  LoadPageLive,
  RestoreToVersionLive,
  SaveSnapshotLive,
  SwitchBranchLive,
)

const mock = Layer.mergeAll(
  AppendEventsMock,
  CreateBranchMock,
  CreatePageMock,
  ListBranchesMock,
  ListPagesMock,
  LoadPageMock,
  RestoreToVersionMock,
  SaveSnapshotMock,
  SwitchBranchMock,
)

export const RepositoriesLive = useMock ? mock : live
