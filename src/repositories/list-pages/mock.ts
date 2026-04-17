import { Effect, Layer } from 'effect'
import type { Page } from '~/app/schema/page'
import { ListPages } from '~/repositories/list-pages/tag'
import { mockPages } from '~/repositories/mock/store'

export const ListPagesMock = Layer.succeed(ListPages, () =>
  Effect.sync((): readonly Page[] => Array.from(mockPages.values())),
)
