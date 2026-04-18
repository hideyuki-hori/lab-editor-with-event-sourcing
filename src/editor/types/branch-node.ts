import type { Branch } from '~/domain/schema/branch'

export type BranchNode = {
  branch: Branch
  children: BranchNode[]
}
