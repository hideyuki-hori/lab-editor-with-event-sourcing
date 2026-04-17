import { Context, type Effect } from 'effect'
import type { EventInput } from '~/editor/schema/event-input'
import type { InvokeError } from '~/errors/invoke-error'

export class AppendEvents extends Context.Tag('@repositories/append-events')<
  AppendEvents,
  (
    pageId: string,
    branchId: string,
    expectedVersion: number,
    events: readonly EventInput[],
    title?: string,
  ) => Effect.Effect<number, InvokeError>
>() {}
