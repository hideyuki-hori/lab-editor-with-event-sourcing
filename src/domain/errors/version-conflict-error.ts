import { Data } from 'effect'

export class VersionConflictError extends Data.TaggedError('VersionConflictError')<{
  readonly expected: number
  readonly actual: number
}> {}
