import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Effect } from 'effect'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BranchTree } from '~/editor/branch-tree'
import { type EditorStatus, EditorToolbar } from '~/editor/editor-toolbar'
import { HistorySlider } from '~/editor/history-slider'
import { useJumpHistory } from '~/editor/hooks/use-jump-history'
import { useSnapshotScheduler } from '~/editor/hooks/use-snapshot-scheduler'
import { useStepPipeline } from '~/editor/hooks/use-step-pipeline'
import { applyRestoredDoc } from '~/editor/lib/apply-restored-doc'
import { EMPTY_CONTENT } from '~/editor/lib/empty-content'
import { previewTitle } from '~/editor/lib/preview-title'
import { tailVersionOf } from '~/editor/lib/tail-version'
import type { Branch } from '~/editor/schema/branch'
import type { EventInput } from '~/editor/schema/event-input'
import type { LoadedPage } from '~/editor/schema/loaded-page'
import { runPromise } from '~/lib/runtime'
import { CreateBranch } from '~/repositories/create-branch/tag'
import { ListBranches } from '~/repositories/list-branches/tag'
import { LoadPage } from '~/repositories/load-page/tag'
import { RestoreToVersion } from '~/repositories/restore-to-version/tag'
import { SwitchBranch } from '~/repositories/switch-branch/tag'

const FLUSH_DEBOUNCE_MS = 400

type Props = {
  selectedId: string | null
}

export function Editor({ selectedId }: Props) {
  const [status, setStatus] = useState<EditorStatus>('idle')
  const [branchId, setBranchId] = useState<string | null>(null)
  const [branchName, setBranchName] = useState<string | null>(null)
  const [headVersion, setHeadVersion] = useState(0)
  const [previewVersion, setPreviewVersion] = useState<number | null>(null)
  const [branches, setBranches] = useState<readonly Branch[]>([])
  const versionRef = useRef(0)
  const loadingRef = useRef(false)
  const currentPageIdRef = useRef<string | null>(null)
  const currentBranchIdRef = useRef<string | null>(null)
  const headVersionRef = useRef(0)
  const previewVersionRef = useRef<number | null>(null)
  const scrubStartRef = useRef<number | null>(null)
  const forkingRef = useRef(false)
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)
  const jumpHistory = useJumpHistory()

  const lastSnapshotVersionRef = useSnapshotScheduler({
    getBranchId: () => currentBranchIdRef.current,
    getDoc: () => editorRef.current?.getJSON() ?? null,
  })

  const updatePreview = useCallback((version: number | null) => {
    previewVersionRef.current = version
    setPreviewVersion(version)
  }, [])

  const refreshBranches = useCallback((streamId: string) => {
    const program = Effect.gen(function* () {
      const listBranches = yield* ListBranches
      const result = yield* listBranches(streamId)
      setBranches(result)
    })
    runPromise(program).catch(console.error)
  }, [])

  const emitSteps = useStepPipeline({
    debounceMs: FLUSH_DEBOUNCE_MS,
    getContext: () => {
      const pageId = currentPageIdRef.current
      const branch = currentBranchIdRef.current
      const ed = editorRef.current
      if (!pageId || !branch || !ed) return null
      return {
        pageId,
        branchId: branch,
        version: versionRef.current,
        title: previewTitle(ed.getJSON()),
      }
    },
    onSaving: () => setStatus('saving'),
    onSaved: (newVersion) => {
      versionRef.current = newVersion
      headVersionRef.current = newVersion
      setHeadVersion(newVersion)
      setStatus('saved')
    },
    onError: (err) => {
      console.error(err)
      setStatus('error')
    },
  })

  const beginAutoFork = (pageId: string, parentBranchId: string, stepEvents: EventInput[]) => {
    const target = previewVersionRef.current
    if (target === null) return
    forkingRef.current = true
    editorRef.current?.setEditable(false)
    const program = Effect.gen(function* () {
      const createBranch = yield* CreateBranch
      const created = yield* createBranch(pageId, parentBranchId, target, undefined)
      currentBranchIdRef.current = created.id
      setBranchId(created.id)
      setBranchName(created.name ?? created.id.slice(0, 8))
      versionRef.current = target
      headVersionRef.current = target
      setHeadVersion(target)
      lastSnapshotVersionRef.current = target
      updatePreview(null)
      jumpHistory.clear()
      emitSteps({ events: stepEvents, pageId, branchId: created.id })
      editorRef.current?.setEditable(true)
      forkingRef.current = false
    })
    runPromise(program).catch((err) => {
      forkingRef.current = false
      editorRef.current?.setEditable(true)
      console.error(err)
      setStatus('error')
    })
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: EMPTY_CONTENT,
    onTransaction: ({ transaction }) => {
      if (loadingRef.current) return
      if (forkingRef.current) return
      if (!transaction.docChanged) return
      const pageId = currentPageIdRef.current
      const branch = currentBranchIdRef.current
      if (!pageId || !branch) return
      const stepEvents: EventInput[] = transaction.steps.map((s) => ({
        kind: 'StepApplied',
        payload: JSON.stringify(s.toJSON()),
      }))
      if (stepEvents.length === 0) return
      if (previewVersionRef.current !== null) {
        beginAutoFork(pageId, branch, stepEvents)
        return
      }
      emitSteps({ events: stepEvents, pageId, branchId: branch })
    },
  })

  editorRef.current = editor

  const adoptLoaded = useCallback(
    (ed: NonNullable<ReturnType<typeof useEditor>>, loaded: LoadedPage) => {
      currentBranchIdRef.current = loaded.branch.id
      setBranchId(loaded.branch.id)
      setBranchName(loaded.branch.name ?? loaded.branch.id.slice(0, 8))
      applyRestoredDoc(
        ed,
        loaded.snapshot?.state ?? null,
        loaded.events.map((e) => ({ payload: e.payload })),
        loadingRef,
      )
      const tail = tailVersionOf(loaded)
      versionRef.current = tail
      headVersionRef.current = tail
      setHeadVersion(tail)
      lastSnapshotVersionRef.current = loaded.snapshot?.version ?? 0
      updatePreview(null)
    },
    [updatePreview, lastSnapshotVersionRef],
  )

  useEffect(() => {
    if (!editor) return
    currentPageIdRef.current = selectedId
    currentBranchIdRef.current = null
    updatePreview(null)
    jumpHistory.clear()
    if (selectedId === null) {
      loadingRef.current = true
      editor.commands.setContent(EMPTY_CONTENT)
      loadingRef.current = false
      versionRef.current = 0
      headVersionRef.current = 0
      setHeadVersion(0)
      lastSnapshotVersionRef.current = 0
      setBranchId(null)
      setBranchName(null)
      setBranches([])
      setStatus('idle')
      return
    }
    const program = Effect.gen(function* () {
      const loadPage = yield* LoadPage
      const loaded = yield* loadPage(selectedId)
      adoptLoaded(editor, loaded)
      setStatus('idle')
    })
    runPromise(program).catch((err) => {
      loadingRef.current = false
      console.error(err)
      setStatus('error')
    })
    refreshBranches(selectedId)
  }, [
    editor,
    selectedId,
    jumpHistory.clear,
    adoptLoaded,
    updatePreview,
    refreshBranches,
    lastSnapshotVersionRef,
  ])

  const applyJump = async (version: number) => {
    const branch = currentBranchIdRef.current
    if (!editor || !branch) return
    if (version < 0 || version > headVersionRef.current) return
    const program = Effect.gen(function* () {
      const restoreToVersion = yield* RestoreToVersion
      const result = yield* restoreToVersion(branch, version)
      applyRestoredDoc(
        editor,
        result.snapshot?.state ?? null,
        result.events.map((e) => ({ payload: e.payload })),
        loadingRef,
      )
      updatePreview(version === headVersionRef.current ? null : version)
    })
    await runPromise(program).catch((err) => {
      console.error(err)
      setStatus('error')
    })
  }

  const recordJump = (fromVersion: number, toVersion: number) => {
    const branch = currentBranchIdRef.current
    if (!branch || fromVersion === toVersion) return
    jumpHistory.push({
      from: { branchId: branch, version: fromVersion },
      to: { branchId: branch, version: toVersion },
    })
  }

  const jumpTo = async (version: number) => {
    const fromVersion = previewVersionRef.current ?? headVersionRef.current
    recordJump(fromVersion, version)
    await applyJump(version)
  }

  const undoJump = async () => {
    const entry = jumpHistory.popUndo()
    if (!entry) return
    await applyJump(entry.from.version)
  }

  const redoJump = async () => {
    const entry = jumpHistory.popRedo()
    if (!entry) return
    await applyJump(entry.to.version)
  }

  const beginScrub = () => {
    scrubStartRef.current = previewVersionRef.current ?? headVersionRef.current
  }

  const scrubTo = async (version: number) => {
    await applyJump(version)
  }

  const endScrub = () => {
    const from = scrubStartRef.current
    const to = previewVersionRef.current ?? headVersionRef.current
    scrubStartRef.current = null
    if (from !== null) recordJump(from, to)
  }

  const handleBranchSelect = async (target: string) => {
    const pageId = currentPageIdRef.current
    if (!editor || !pageId) return
    if (target === currentBranchIdRef.current) return
    const program = Effect.gen(function* () {
      const switchBranch = yield* SwitchBranch
      const loaded = yield* switchBranch(pageId, target)
      adoptLoaded(editor, loaded)
      jumpHistory.clear()
    })
    await runPromise(program).catch((err) => {
      console.error(err)
      setStatus('error')
    })
  }

  const currentVersion = previewVersion ?? headVersion
  const isPreview = previewVersion !== null

  return (
    <section className='flex-1 p-8'>
      <EditorToolbar
        selectedId={selectedId}
        branchName={branchName}
        currentVersion={currentVersion}
        headVersion={headVersion}
        isPreview={isPreview}
        status={status}
        undoSize={jumpHistory.undoSize}
        redoSize={jumpHistory.redoSize}
        onJumpTo={jumpTo}
        onUndo={undoJump}
        onRedo={redoJump}
      />
      {selectedId !== null && (
        <div className='mb-3'>
          <HistorySlider
            current={currentVersion}
            head={headVersion}
            onBeginScrub={beginScrub}
            onScrub={scrubTo}
            onEndScrub={endScrub}
          />
        </div>
      )}
      {selectedId !== null && branchId !== null && (
        <div className='mb-4'>
          <BranchTree
            branches={branches}
            currentBranchId={branchId}
            onSelect={handleBranchSelect}
          />
        </div>
      )}
      <EditorContent editor={editor} className='editor' />
    </section>
  )
}
