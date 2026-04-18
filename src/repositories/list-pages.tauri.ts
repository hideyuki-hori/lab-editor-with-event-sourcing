import { Effect, Layer, Schema } from 'effect'
import { Page } from '~/domain/schema/page'
import { ListPages } from '~/domain/usecase/list-pages'
import { decodeWith } from '~/repositories/decode-with'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toRepositoryError } from '~/repositories/tauri-error'

export const ListPagesTauri = Layer.succeed(ListPages, () =>
  invokeTauri<unknown>('list_pages').pipe(
    Effect.flatMap(decodeWith(Schema.Array(Page), 'list_pages')),
    Effect.mapError(toRepositoryError('list_pages')),
  ),
)
