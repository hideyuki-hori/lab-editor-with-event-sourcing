import { Chunk, Duration, Effect, Fiber, Schedule, Stream } from 'effect'
import { useCallback, useEffect, useRef } from 'react'
import type { EventInput } from '~/editor/schema/event-input'
import { runFork } from '~/lib/runtime'
import { AppendEvents } from '~/repositories/append-events/tag'

const MAX_BATCH = 1000

type Emitted = {
  events: EventInput[]
  pageId: string
  branchId: string
}

type Context = {
  pageId: string
  branchId: string
  version: number
  title: string
}

type Params = {
  debounceMs: number
  getContext: () => Context | null
  onSaving: () => void
  onSaved: (newVersion: number) => void
  onError: (err: unknown) => void
}

export function useStepPipeline(params: Params) {
  const paramsRef = useRef(params)
  paramsRef.current = params

  const emitRef = useRef<((emitted: Emitted) => void) | null>(null)

  useEffect(() => {
    const stream = Stream.async<Emitted>((emit) => {
      emitRef.current = (e) => {
        emit(Effect.succeed(Chunk.of(e)))
      }
    })

    const retryPolicy = Schedule.exponential(Duration.millis(100)).pipe(
      Schedule.compose(Schedule.recurs(3)),
    )

    const pipeline = stream.pipe(
      Stream.groupedWithin(MAX_BATCH, Duration.millis(paramsRef.current.debounceMs)),
      Stream.mapEffect((chunk) =>
        Effect.gen(function* () {
          const arr = Chunk.toReadonlyArray(chunk)
          if (arr.length === 0) return
          const first = arr[0]
          const batch = arr
            .filter((e) => e.pageId === first.pageId && e.branchId === first.branchId)
            .flatMap((e) => e.events)
          if (batch.length === 0) return
          const ctx = paramsRef.current.getContext()
          if (!ctx || ctx.pageId !== first.pageId || ctx.branchId !== first.branchId) return
          paramsRef.current.onSaving()
          const appendEvents = yield* AppendEvents
          const newVersion = yield* appendEvents(
            ctx.pageId,
            ctx.branchId,
            ctx.version,
            batch,
            ctx.title,
          ).pipe(Effect.retry(retryPolicy))
          paramsRef.current.onSaved(newVersion)
        }).pipe(
          Effect.catchAll((err) => {
            paramsRef.current.onError(err)
            return Effect.succeed(undefined)
          }),
        ),
      ),
      Stream.runDrain,
    )

    const fiber = runFork(pipeline)

    return () => {
      runFork(Fiber.interrupt(fiber))
    }
  }, [])

  const emit = useCallback((emitted: Emitted) => {
    emitRef.current?.(emitted)
  }, [])

  return emit
}
