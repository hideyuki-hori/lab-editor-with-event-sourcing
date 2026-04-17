import type { Branch } from '~/editor/schema/branch'
import type { BranchNode } from '~/editor/types/branch-node'

export const buildBranchTree = (branches: readonly Branch[]): BranchNode[] => {
  const map = new Map<string, BranchNode>()
  for (const b of branches) {
    map.set(b.id, { branch: b, children: [] })
  }
  const roots: BranchNode[] = []
  for (const b of branches) {
    const node = map.get(b.id)
    if (!node) continue
    if (b.parent_branch_id) {
      const parent = map.get(b.parent_branch_id)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }
  const sort = (nodes: BranchNode[]) => {
    nodes.sort((a, b) => a.branch.created_at - b.branch.created_at)
    for (const n of nodes) sort(n.children)
  }
  sort(roots)
  return roots
}
