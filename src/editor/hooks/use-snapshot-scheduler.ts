import type { JSONContent } from '@tiptap/react'
import { Effect } from 'effect'
import { useRef } from 'react'
import { SaveSnapshot } from '~/domain/usecase'
import { useStepsApplied } from '~/hooks/use-steps-applied'
import { useRunPromise } from '~/react-effect'

const SNAPSHOT_INTERVAL = 50

type Params = {
  getBranchId: () => string | null
  getDoc: () => JSONContent | null
}

export function useSnapshotScheduler({ getBranchId, getDoc }: Params) {
  const lastSnapshotVersionRef = useRef(0)
  const runPromise = useRunPromise()

  useStepsApplied((payload) => {
    if (payload.branchId !== getBranchId()) return
    if (payload.version - lastSnapshotVersionRef.current < SNAPSHOT_INTERVAL) return
    const doc = getDoc()
    if (!doc) return
    lastSnapshotVersionRef.current = payload.version
    const program = Effect.gen(function* () {
      const saveSnapshot = yield* SaveSnapshot
      yield* saveSnapshot(payload.branchId, payload.version, doc)
    })
    runPromise(program).catch((err) => {
      console.error(err)
    })
  })

  return lastSnapshotVersionRef
}
