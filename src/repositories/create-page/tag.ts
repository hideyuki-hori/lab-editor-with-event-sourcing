import { Context, type Effect } from 'effect'
import type { Page } from '~/app/schema/page'
import type { DecodeError } from '~/errors/decode-error'
import type { InvokeError } from '~/errors/invoke-error'

export class CreatePage extends Context.Tag('@repositories/create-page')<
  CreatePage,
  (title?: string) => Effect.Effect<Page, InvokeError | DecodeError>
>() {}
