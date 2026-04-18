import { NotFoundError, RepositoryError, VersionConflictError } from '~/domain/errors'
import type { DecodeError } from '~/repositories/decode-error'
import type { InvokeError } from '~/repositories/invoke-error'

export type TechnicalError = InvokeError | DecodeError

const messageOf = (error: TechnicalError): string => {
  if (error._tag === 'InvokeError') return String(error.cause)
  return String(error.cause)
}

const isNotFound = (message: string) =>
  message.includes('no rows returned') || message.toLowerCase().includes('not found')

const parseVersionConflict = (message: string) => {
  const match = message.match(/version conflict: expected (-?\d+), stored (-?\d+)/)
  if (!match) return null
  return { expected: Number(match[1]), actual: Number(match[2]) }
}

export const toRepositoryError = (operation: string) => (error: TechnicalError) =>
  new RepositoryError({ operation, cause: error })

export const toNotFoundOrRepositoryError =
  (operation: string, entity: string, id: string) => (error: TechnicalError) => {
    if (error._tag === 'InvokeError' && isNotFound(messageOf(error))) {
      return new NotFoundError({ entity, id })
    }
    return new RepositoryError({ operation, cause: error })
  }

export const toAppendEventsError = (error: TechnicalError) => {
  if (error._tag === 'InvokeError') {
    const conflict = parseVersionConflict(messageOf(error))
    if (conflict) return new VersionConflictError(conflict)
  }
  return new RepositoryError({ operation: 'append_events', cause: error })
}
