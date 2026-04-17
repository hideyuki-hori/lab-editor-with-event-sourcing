export type EditorStatus = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  selectedId: string | null
  branchName: string | null
  currentVersion: number
  headVersion: number
  isPreview: boolean
  status: EditorStatus
  undoSize: number
  redoSize: number
  onJumpTo: (version: number) => void
  onUndo: () => void
  onRedo: () => void
}

export function EditorToolbar({
  selectedId,
  branchName,
  currentVersion,
  headVersion,
  isPreview,
  status,
  undoSize,
  redoSize,
  onJumpTo,
  onUndo,
  onRedo,
}: Props) {
  return (
    <div className='mb-3 flex flex-wrap items-center gap-3 text-xs'>
      {selectedId !== null && <span className='text-gray-500'>id: {selectedId}</span>}
      {branchName !== null && (
        <span className='rounded bg-gray-100 px-2 py-0.5 text-gray-700'>@ {branchName}</span>
      )}
      {selectedId !== null && (
        <span className='text-gray-500'>
          v{currentVersion} / {headVersion}
        </span>
      )}
      {selectedId !== null && (
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => onJumpTo(currentVersion - 1)}
            disabled={currentVersion <= 0}
            className='rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40'
          >
            ←
          </button>
          <button
            type='button'
            onClick={() => onJumpTo(currentVersion + 1)}
            disabled={currentVersion >= headVersion}
            className='rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40'
          >
            →
          </button>
        </div>
      )}
      {selectedId !== null && (
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={onUndo}
            disabled={undoSize === 0}
            className='rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40'
            title='ジャンプを取り消し'
          >
            ↶ jump-undo ({undoSize})
          </button>
          <button
            type='button'
            onClick={onRedo}
            disabled={redoSize === 0}
            className='rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40'
            title='ジャンプをやり直し'
          >
            ↷ jump-redo ({redoSize})
          </button>
        </div>
      )}
      {isPreview && (
        <span
          className='rounded bg-yellow-100 px-2 py-0.5 text-yellow-800'
          title='編集を開始すると新ブランチに自動fork'
        >
          preview
        </span>
      )}
      {status === 'saving' && <span className='text-gray-500'>saving...</span>}
      {status === 'saved' && <span className='text-green-600'>saved</span>}
      {status === 'error' && <span className='text-red-600'>error</span>}
    </div>
  )
}
