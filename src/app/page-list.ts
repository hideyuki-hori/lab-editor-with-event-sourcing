import { Effect, Option, type Scope, Stream } from 'effect'
import type { Page } from '~/domain/schema/page'
import { bindClass, bindList, bindWhen, fromEvent, h, mount } from '~/ui'

const renderItem = (
  page: Page,
  selectedId$: Stream.Stream<Option.Option<string>>,
  onSelect: (id: string) => Effect.Effect<void>,
): Effect.Effect<HTMLElement, never, Scope.Scope> =>
  Effect.gen(function* () {
    const title = page.title.length > 0 ? page.title : 'Untitled'
    const button = h('button', { class: 'w-full truncate rounded px-2 py-1 text-left text-sm' }, [
      title,
    ])
    button.type = 'button'
    const li = h('li', {}, [button])

    const active$ = selectedId$.pipe(
      Stream.map(
        Option.match({
          onNone: () => false,
          onSome: (id) => id === page.id,
        }),
      ),
    )
    yield* bindClass(button, 'bg-gray-200', active$)
    yield* bindClass(button, 'font-medium', active$)
    yield* bindClass(button, 'hover:bg-gray-100', active$.pipe(Stream.map((v) => !v)))

    const clicks = fromEvent(button, 'click').pipe(Stream.runForEach(() => onSelect(page.id)))
    yield* Effect.forkScoped(clicks)

    return li
  })

const renderEmpty = (): Effect.Effect<HTMLElement, never, Scope.Scope> =>
  Effect.sync(() => h('li', { class: 'px-2 text-xs text-gray-400' }, ['no pages']))

export const pageList = (
  parent: Element,
  params: {
    pages$: Stream.Stream<readonly Page[]>
    selectedId$: Stream.Stream<Option.Option<string>>
    onSelect: (id: string) => Effect.Effect<void>
    onCreate: () => Effect.Effect<void>
  },
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const aside = h('aside', { class: 'w-64 border-r border-gray-200 p-4' })
    const newButton = h(
      'button',
      { class: 'w-full rounded bg-black px-3 py-1 text-sm text-white' },
      ['+ New'],
    )
    newButton.type = 'button'
    const list = h('ul', { class: 'mt-4 space-y-1' })
    aside.append(newButton, list)

    yield* mount(parent, aside)

    const newClicks = fromEvent(newButton, 'click').pipe(Stream.runForEach(() => params.onCreate()))
    yield* Effect.forkScoped(newClicks)

    yield* bindList(
      list,
      params.pages$,
      (p) => p.id,
      (p) => renderItem(p, params.selectedId$, params.onSelect),
    )

    const emptyMarker$ = params.pages$.pipe(
      Stream.map((pages) => (pages.length === 0 ? Option.some(true) : Option.none())),
    )
    yield* bindWhen(list, emptyMarker$, () => renderEmpty())
  })
