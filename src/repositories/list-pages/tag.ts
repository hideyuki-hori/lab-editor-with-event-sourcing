import { Context, type Effect } from 'effect'
import type { Page } from '~/app/schema/page'
import type { DecodeError } from '~/errors/decode-error'
import type { InvokeError } from '~/errors/invoke-error'

export class ListPages extends Context.Tag('@repositories/list-pages')<
  ListPages,
  () => Effect.Effect<readonly Page[], InvokeError | DecodeError>
>() {}
