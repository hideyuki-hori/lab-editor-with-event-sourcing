import type { JSONContent } from '@tiptap/core'
import { Context, type Effect } from 'effect'
import type { RepositoryError } from '~/domain/errors'

export class SaveSnapshot extends Context.Tag('@usecase/save-snapshot')<
  SaveSnapshot,
  (branchId: string, version: number, state: JSONContent) => Effect.Effect<void, RepositoryError>
>() {}
