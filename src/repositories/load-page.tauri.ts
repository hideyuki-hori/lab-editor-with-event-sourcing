import { Effect, Layer } from 'effect'
import { LoadedPage } from '~/domain/schema/loaded-page'
import { LoadPage } from '~/domain/usecase/load-page'
import { decodeWith } from '~/repositories/decode-with'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toNotFoundOrRepositoryError } from '~/repositories/tauri-error'

export const LoadPageTauri = Layer.succeed(LoadPage, (id: string) =>
  invokeTauri<unknown>('load_page', { id }).pipe(
    Effect.flatMap(decodeWith(LoadedPage, 'load_page')),
    Effect.mapError(toNotFoundOrRepositoryError('load_page', 'Page', id)),
  ),
)
