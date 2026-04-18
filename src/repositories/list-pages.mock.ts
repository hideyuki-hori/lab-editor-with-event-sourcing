import { Effect, Layer } from 'effect'
import type { Page } from '~/domain/schema/page'
import { ListPages } from '~/domain/usecase/list-pages'
import { mockPages } from '~/repositories/mock-store'

export const ListPagesMock = Layer.succeed(ListPages, () =>
  Effect.sync((): readonly Page[] => Array.from(mockPages.values())),
)
