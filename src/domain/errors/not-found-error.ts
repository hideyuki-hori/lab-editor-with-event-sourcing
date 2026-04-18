import { Data } from 'effect'

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly entity: string
  readonly id: string
}> {}
