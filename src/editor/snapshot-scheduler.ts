import type { JSONContent } from '@tiptap/core'
import { Effect, Option, Ref, type Scope, Stream } from 'effect'
import type { StepsAppliedPayload } from '~/domain/schema/steps-applied-payload'
import { SaveSnapshot } from '~/domain/usecase'

const SNAPSHOT_INTERVAL = 50

export type SnapshotScheduler = {
  readonly setLastVersion: (version: number) => Effect.Effect<void>
}

type Params = {
  readonly getBranchId: () => Effect.Effect<Option.Option<string>>
  readonly getDoc: () => Effect.Effect<Option.Option<JSONContent>>
  readonly stepsApplied$: Stream.Stream<StepsAppliedPayload>
  readonly initialVersion: number
}

export const snapshotScheduler = (
  params: Params,
): Effect.Effect<SnapshotScheduler, never, Scope.Scope | SaveSnapshot> =>
  Effect.gen(function* () {
    const saveSnapshot = yield* SaveSnapshot
    const lastVersion = yield* Ref.make(params.initialVersion)

    const handler = (payload: StepsAppliedPayload): Effect.Effect<void> =>
      Effect.gen(function* () {
        const currentBranchId = yield* params.getBranchId()
        if (Option.isNone(currentBranchId)) return
        if (payload.branchId !== currentBranchId.value) return
        const last = yield* Ref.get(lastVersion)
        if (payload.version - last < SNAPSHOT_INTERVAL) return
        const doc = yield* params.getDoc()
        if (Option.isNone(doc)) return
        yield* Ref.set(lastVersion, payload.version)
        yield* saveSnapshot(payload.branchId, payload.version, doc.value).pipe(
          Effect.tapError((err) => Effect.logError(err)),
          Effect.catchAll(() => Effect.void),
        )
      })

    yield* Effect.forkScoped(Stream.runForEach(params.stepsApplied$, handler))

    const setLastVersion = (version: number): Effect.Effect<void> => Ref.set(lastVersion, version)

    return { setLastVersion }
  })
