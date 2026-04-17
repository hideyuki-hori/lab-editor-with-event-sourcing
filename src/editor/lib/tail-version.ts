import type { LoadedPage } from '~/editor/schema/loaded-page'

export const tailVersionOf = (loaded: LoadedPage) =>
  loaded.events.length > 0
    ? loaded.events[loaded.events.length - 1].version
    : (loaded.snapshot?.version ?? 0)
