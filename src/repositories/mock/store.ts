import type { Page } from '~/app/schema/page'
import type { Branch } from '~/editor/schema/branch'
import type { StoredEvent } from '~/editor/schema/stored-event'
import type { StoredSnapshot } from '~/editor/schema/stored-snapshot'

export const mockPages = new Map<string, Page>()
export const mockBranches = new Map<string, Branch>()
export const mockBranchesByStream = new Map<string, string[]>()
export const mockEvents = new Map<string, StoredEvent[]>()
export const mockSnapshots = new Map<string, StoredSnapshot>()

let sequenceCounter = 0
export const nextSequence = () => ++sequenceCounter
