import type { Branch } from '~/domain/schema/branch'
import { buildBranchTree } from '~/editor/lib/build-branch-tree'
import type { BranchNode } from '~/editor/types/branch-node'

type Props = {
  branches: readonly Branch[]
  currentBranchId: string
  onSelect: (branchId: string) => void
}

type Ancestor = { branchId: string; hasMore: boolean }

type ItemProps = {
  node: BranchNode
  depth: number
  isLast: boolean
  ancestors: readonly Ancestor[]
  currentBranchId: string
  onSelect: (branchId: string) => void
}

function BranchItem({ node, depth, isLast, ancestors, currentBranchId, onSelect }: ItemProps) {
  const active = node.branch.id === currentBranchId
  const label = node.branch.name ?? node.branch.id.slice(0, 8)
  const forkInfo = node.branch.parentBranchId !== null ? ` (v${node.branch.forkVersion})` : ''
  const guides = ancestors.map((a) => (
    <span key={a.branchId} className='inline-block w-4 text-gray-300'>
      {a.hasMore ? '│' : ' '}
    </span>
  ))
  const connector =
    depth === 0 ? (
      <span className='inline-block w-4 text-gray-400'>●</span>
    ) : (
      <span className='inline-block w-4 text-gray-400'>{isLast ? '└' : '├'}─</span>
    )
  const childAncestors: readonly Ancestor[] = [
    ...ancestors,
    { branchId: node.branch.id, hasMore: !isLast },
  ]
  return (
    <div>
      <div className='flex items-center font-mono'>
        {guides}
        {connector}
        <button
          type='button'
          onClick={() => onSelect(node.branch.id)}
          className={
            active
              ? 'ml-1 rounded bg-black px-2 py-0.5 font-sans text-white'
              : 'ml-1 rounded border border-gray-300 px-2 py-0.5 font-sans text-gray-700 hover:bg-gray-100'
          }
        >
          {label}
          {forkInfo}
        </button>
      </div>
      {node.children.map((child, idx) => (
        <BranchItem
          key={child.branch.id}
          node={child}
          depth={depth + 1}
          isLast={idx === node.children.length - 1}
          ancestors={childAncestors}
          currentBranchId={currentBranchId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export function BranchTree({ branches, currentBranchId, onSelect }: Props) {
  if (branches.length === 0) return null
  const roots = buildBranchTree(branches)
  return (
    <div className='flex flex-col gap-0.5 text-xs'>
      <span className='text-gray-500'>branches:</span>
      {roots.map((r, idx) => (
        <BranchItem
          key={r.branch.id}
          node={r}
          depth={0}
          isLast={idx === roots.length - 1}
          ancestors={[]}
          currentBranchId={currentBranchId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
