import type { JSONContent } from '@tiptap/react'
import { Context, type Effect } from 'effect'
import type { InvokeError } from '~/errors/invoke-error'

export class SaveSnapshot extends Context.Tag('@repositories/save-snapshot')<
  SaveSnapshot,
  (branchId: string, version: number, state: JSONContent) => Effect.Effect<void, InvokeError>
>() {}
