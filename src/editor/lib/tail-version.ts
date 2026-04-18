import { Option } from 'effect'
import type { LoadedPage } from '~/domain/schema/loaded-page'

export const tailVersionOf = (loaded: LoadedPage): number =>
  loaded.events.length > 0
    ? loaded.events[loaded.events.length - 1].version
    : Option.getOrElse(
        Option.map(Option.fromNullable(loaded.snapshot), (s) => s.version),
        () => 0,
      )
