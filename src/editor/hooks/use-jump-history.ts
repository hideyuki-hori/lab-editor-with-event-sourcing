import { useCallback, useRef, useState } from 'react'
import type { JumpEntry } from '~/editor/types/jump-entry'

export function useJumpHistory() {
  const undoStackRef = useRef<JumpEntry[]>([])
  const redoStackRef = useRef<JumpEntry[]>([])
  const [undoSize, setUndoSize] = useState(0)
  const [redoSize, setRedoSize] = useState(0)

  const sync = useCallback(() => {
    setUndoSize(undoStackRef.current.length)
    setRedoSize(redoStackRef.current.length)
  }, [])

  const push = useCallback(
    (entry: JumpEntry) => {
      undoStackRef.current.push(entry)
      redoStackRef.current = []
      sync()
    },
    [sync],
  )

  const popUndo = useCallback((): JumpEntry | null => {
    const stack = undoStackRef.current
    if (stack.length === 0) return null
    const entry = stack[stack.length - 1]
    undoStackRef.current = stack.slice(0, -1)
    redoStackRef.current.push(entry)
    sync()
    return entry
  }, [sync])

  const popRedo = useCallback((): JumpEntry | null => {
    const stack = redoStackRef.current
    if (stack.length === 0) return null
    const entry = stack[stack.length - 1]
    redoStackRef.current = stack.slice(0, -1)
    undoStackRef.current.push(entry)
    sync()
    return entry
  }, [sync])

  const clear = useCallback(() => {
    undoStackRef.current = []
    redoStackRef.current = []
    sync()
  }, [sync])

  return { push, popUndo, popRedo, clear, undoSize, redoSize }
}
