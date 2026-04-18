import type { Branch } from '~/domain/schema/branch'
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
    if (b.parentBranchId) {
      const parent = map.get(b.parentBranchId)
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
    nodes.sort((a, b) => a.branch.createdAt - b.branch.createdAt)
    for (const n of nodes) sort(n.children)
  }
  sort(roots)
  return roots
}
