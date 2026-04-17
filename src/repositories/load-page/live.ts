import { Effect, Layer } from 'effect'
import { LoadedPage } from '~/editor/schema/loaded-page'
import { decodeWith } from '~/lib/decode-with'
import { invokeTauri } from '~/lib/invoke-tauri'
import { LoadPage } from '~/repositories/load-page/tag'

export const LoadPageLive = Layer.succeed(LoadPage, (id: string) =>
  invokeTauri<unknown>('load_page', { id }).pipe(
    Effect.flatMap(decodeWith(LoadedPage, 'load_page')),
  ),
)
