import { Effect, Schema } from 'effect'
import { DecodeError } from '~/errors/decode-error'

export const decodeWith =
  <A, I>(schema: Schema.Schema<A, I>, command: string) =>
  (value: unknown) =>
    Schema.decodeUnknown(schema)(value).pipe(
      Effect.mapError((cause) => new DecodeError({ command, cause })),
    )
