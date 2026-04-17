import { Context, type Effect } from 'effect'
import type { LoadedPage } from '~/editor/schema/loaded-page'
import type { DecodeError } from '~/errors/decode-error'
import type { InvokeError } from '~/errors/invoke-error'

export class LoadPage extends Context.Tag('@repositories/load-page')<
  LoadPage,
  (id: string) => Effect.Effect<LoadedPage, InvokeError | DecodeError>
>() {}
