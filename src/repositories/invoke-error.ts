import { Data } from 'effect'

export class InvokeError extends Data.TaggedError('InvokeError')<{
  readonly command: string
  readonly cause: unknown
}> {}
