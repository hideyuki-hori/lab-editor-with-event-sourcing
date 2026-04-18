import type { Branch } from '~/domain/schema/branch'
import type { Page } from '~/domain/schema/page'
import type { StepsAppliedPayload } from '~/domain/schema/steps-applied-payload'
import type { StoredEvent } from '~/domain/schema/stored-event'
import type { StoredSnapshot } from '~/domain/schema/stored-snapshot'

export const mockPages = new Map<string, Page>()
export const mockBranches = new Map<string, Branch>()
export const mockBranchesByStream = new Map<string, string[]>()
export const mockEvents = new Map<string, StoredEvent[]>()
export const mockSnapshots = new Map<string, StoredSnapshot>()

let sequenceCounter = 0
export const nextSequence = () => ++sequenceCounter

class Emitter<T> {
  private listeners = new Set<(value: T) => void>()
  emit(value: T) {
    for (const listener of this.listeners) listener(value)
  }
  on(listener: (value: T) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export const mockPagesChangedEmitter = new Emitter<void>()
export const mockStepsAppliedEmitter = new Emitter<StepsAppliedPayload>()
