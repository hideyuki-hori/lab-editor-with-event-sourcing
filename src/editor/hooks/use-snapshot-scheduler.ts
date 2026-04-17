import type { JSONContent } from '@tiptap/react'
import { Effect } from 'effect'
import { useRef } from 'react'
import { useTauriEvent } from '~/hooks/use-tauri-event'
import { runPromise } from '~/lib/runtime'
import { SaveSnapshot } from '~/repositories/save-snapshot/tag'

const SNAPSHOT_INTERVAL = 50

type Payload = {
  stream_id: string
  branch_id: string
  version: number
}

type Params = {
  getBranchId: () => string | null
  getDoc: () => JSONContent | null
}

export function useSnapshotScheduler({ getBranchId, getDoc }: Params) {
  const lastSnapshotVersionRef = useRef(0)

  useTauriEvent<Payload>('steps_applied', (payload) => {
    if (payload.branch_id !== getBranchId()) return
    if (payload.version - lastSnapshotVersionRef.current < SNAPSHOT_INTERVAL) return
    const doc = getDoc()
    if (!doc) return
    lastSnapshotVersionRef.current = payload.version
    const program = Effect.gen(function* () {
      const saveSnapshot = yield* SaveSnapshot
      yield* saveSnapshot(payload.branch_id, payload.version, doc)
    })
    runPromise(program).catch((err) => {
      console.error(err)
    })
  })

  return lastSnapshotVersionRef
}
