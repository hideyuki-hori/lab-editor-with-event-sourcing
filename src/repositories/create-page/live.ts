import { Effect, Layer } from 'effect'
import { Page } from '~/app/schema/page'
import { decodeWith } from '~/lib/decode-with'
import { invokeTauri } from '~/lib/invoke-tauri'
import { CreatePage } from '~/repositories/create-page/tag'

export const CreatePageLive = Layer.succeed(CreatePage, (title?: string) =>
  invokeTauri<unknown>('create_page', { title }).pipe(
    Effect.flatMap(decodeWith(Page, 'create_page')),
  ),
)
