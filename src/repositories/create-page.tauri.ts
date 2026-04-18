import { Effect, Layer } from 'effect'
import { Page } from '~/domain/schema/page'
import { CreatePage } from '~/domain/usecase/create-page'
import { decodeWith } from '~/repositories/decode-with'
import { invokeTauri } from '~/repositories/invoke-tauri'
import { toRepositoryError } from '~/repositories/tauri-error'

export const CreatePageTauri = Layer.succeed(CreatePage, (title?: string) =>
  invokeTauri<unknown>('create_page', { title }).pipe(
    Effect.flatMap(decodeWith(Page, 'create_page')),
    Effect.mapError(toRepositoryError('create_page')),
  ),
)
