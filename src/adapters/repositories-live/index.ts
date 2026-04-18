import { isTauri } from '@tauri-apps/api/core'
import { Layer } from 'effect'
import { MockLive } from '~/adapters/repositories-live/mock'
import { TauriLive } from '~/adapters/repositories-live/tauri'

export const RepositoriesLive = Layer.suspend(() => (isTauri() ? TauriLive : MockLive))
