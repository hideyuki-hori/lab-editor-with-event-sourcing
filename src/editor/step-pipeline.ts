import { Chunk, Duration, Effect, Option, Queue, Schedule, type Scope, Stream } from 'effect'
import type { EventInput } from '~/domain/schema/event-input'
import { AppendEvents } from '~/domain/usecase'

const MAX_BATCH = 1000

export type Emitted = {
  readonly events: readonly EventInput[]
  readonly pageId: string
  readonly branchId: string
}

export type Context = {
  readonly pageId: string
  readonly branchId: string
  readonly version: number
  readonly title: string
}

type Params = {
  readonly debounceMs: number
  readonly getContext: () => Effect.Effect<Option.Option<Context>>
  readonly onSaving: Effect.Effect<void>
  readonly onSaved: (version: number) => Effect.Effect<void>
  readonly onError: (err: unknown) => Effect.Effect<void>
}

export const stepPipeline = (
  params: Params,
): Effect.Effect<(emitted: Emitted) => Effect.Effect<void>, never, Scope.Scope | AppendEvents> =>
  Effect.gen(function* () {
    const appendEvents = yield* AppendEvents
    const queue = yield* Effect.acquireRelease(Queue.unbounded<Emitted>(), (q) => Queue.shutdown(q))

    const retryPolicy = Schedule.exponential(Duration.millis(100)).pipe(
      Schedule.compose(Schedule.recurs(3)),
    )

    const pipeline = Stream.fromQueue(queue).pipe(
      Stream.groupedWithin(MAX_BATCH, Duration.millis(params.debounceMs)),
      Stream.mapEffect((chunk) =>
        Effect.gen(function* () {
          const arr = Chunk.toReadonlyArray(chunk)
          if (arr.length === 0) return
          const first = arr[0]
          const batch = arr
            .filter((e) => e.pageId === first.pageId && e.branchId === first.branchId)
            .flatMap((e) => e.events)
          if (batch.length === 0) return
          const ctxOpt = yield* params.getContext()
          if (Option.isNone(ctxOpt)) return
          const ctx = ctxOpt.value
          if (ctx.pageId !== first.pageId || ctx.branchId !== first.branchId) return
          yield* params.onSaving
          const newVersion = yield* appendEvents(
            ctx.pageId,
            ctx.branchId,
            ctx.version,
            batch,
            ctx.title,
          ).pipe(Effect.retry(retryPolicy))
          yield* params.onSaved(newVersion)
        }).pipe(Effect.catchAll((err) => params.onError(err))),
      ),
      Stream.runDrain,
    )

    yield* Effect.forkScoped(pipeline)

    const emit = (emitted: Emitted): Effect.Effect<void> =>
      Queue.offer(queue, emitted).pipe(Effect.asVoid)

    return emit
  })
