import { Effect, Layer, Schema } from 'effect'
import { Page } from '~/app/schema/page'
import { decodeWith } from '~/lib/decode-with'
import { invokeTauri } from '~/lib/invoke-tauri'
import { ListPages } from '~/repositories/list-pages/tag'

export const ListPagesLive = Layer.succeed(ListPages, () =>
  invokeTauri<unknown>('list_pages').pipe(
    Effect.flatMap(decodeWith(Schema.Array(Page), 'list_pages')),
  ),
)
