import { Effect, type Layer, Option, type Scope, Stream, SubscriptionRef } from 'effect'
import { pageList } from '~/app/page-list'
import type { Page } from '~/domain/schema/page'
import { CreatePage, ListPages, SubscribePagesChanged } from '~/domain/usecase'
import { editor } from '~/editor'
import type { AppLayer } from '~/runtime'
import { h, mount } from '~/ui'

type AppR = Layer.Layer.Success<typeof AppLayer>

const subscribePagesChanged$ = (
  subscribe: (handler: () => void) => Effect.Effect<() => void>,
): Stream.Stream<void> =>
  Stream.asyncPush<void>((emit) =>
    Effect.acquireRelease(
      subscribe(() => {
        emit.single(undefined)
      }),
      (unsubscribe) => Effect.sync(() => unsubscribe()),
    ),
  )

export const app = (parent: Element): Effect.Effect<void, never, Scope.Scope | AppR> =>
  Effect.gen(function* () {
    const listPages = yield* ListPages
    const createPage = yield* CreatePage
    const subscribePages = yield* SubscribePagesChanged

    const pages$ = yield* SubscriptionRef.make<readonly Page[]>([])
    const selectedId$ = yield* SubscriptionRef.make<Option.Option<string>>(Option.none())

    const refresh = Effect.gen(function* () {
      const result = yield* listPages()
      yield* SubscriptionRef.set(pages$, result)
    }).pipe(
      Effect.tapError((err) => Effect.logError(err)),
      Effect.catchAll(() => Effect.void),
    )

    const handleSelect = (id: string) => SubscriptionRef.set(selectedId$, Option.some(id))

    const handleCreate = Effect.gen(function* () {
      const page = yield* createPage('Untitled')
      yield* SubscriptionRef.set(selectedId$, Option.some(page.id))
    }).pipe(
      Effect.tapError((err) => Effect.logError(err)),
      Effect.catchAll(() => Effect.void),
    )

    yield* refresh

    yield* Effect.forkScoped(
      Stream.runForEach(subscribePagesChanged$(subscribePages), () => refresh),
    )

    const main = h('main', { class: 'flex h-screen' })

    yield* pageList(main, {
      pages$: pages$.changes,
      selectedId$: selectedId$.changes,
      onSelect: handleSelect,
      onCreate: () => handleCreate,
    })

    const editorSection = h('section', { class: 'flex-1 p-8' })
    main.appendChild(editorSection)

    yield* editor(editorSection, { selectedId$: selectedId$.changes })

    yield* mount(parent, main)
  })
