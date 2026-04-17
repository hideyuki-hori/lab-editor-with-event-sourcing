import type { Branch } from '~/editor/schema/branch'

export type BranchNode = {
  branch: Branch
  children: BranchNode[]
}
