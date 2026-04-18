import { Context, type Effect } from 'effect'
import type { RepositoryError, VersionConflictError } from '~/domain/errors'
import type { EventInput } from '~/domain/schema/event-input'

export class AppendEvents extends Context.Tag('@usecase/append-events')<
  AppendEvents,
  (
    pageId: string,
    branchId: string,
    expectedVersion: number,
    events: readonly EventInput[],
    title?: string,
  ) => Effect.Effect<number, VersionConflictError | RepositoryError>
>() {}
