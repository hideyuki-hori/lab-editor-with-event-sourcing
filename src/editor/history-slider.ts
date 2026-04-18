import { Duration, Effect, type Scope, Stream, SubscriptionRef } from 'effect'
import { bindProp, bindShow, bindText, fromEvent, h, mount } from '~/ui'

const SCRUB_DEBOUNCE = Duration.millis(100)

const parseRangeValue = (el: HTMLInputElement): number => Number.parseInt(el.value, 10)

export const historySlider = (
  parent: Element,
  params: {
    current$: Stream.Stream<number>
    head$: Stream.Stream<number>
    onBeginScrub: () => Effect.Effect<void>
    onScrub: (version: number) => Effect.Effect<void>
    onEndScrub: () => Effect.Effect<void>
  },
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const root = h('div', { class: 'flex items-center gap-2 text-xs' })
    const label = h('span', { class: 'text-gray-500' }, ['history'])
    const input = h('input', { class: 'flex-1' })
    input.type = 'range'
    const readout = h('span', { class: 'w-12 text-right text-gray-500' })
    root.append(label, input, readout)

    const local = yield* SubscriptionRef.make(0)

    yield* Effect.forkScoped(
      Stream.runForEach(params.current$, (value) => SubscriptionRef.set(local, value)),
    )

    const head$ = params.head$
    yield* bindShow(root, head$.pipe(Stream.map((v) => v !== 0)))
    yield* bindProp(input, 'min', head$.pipe(Stream.map(() => '0')))
    yield* bindProp(input, 'max', head$.pipe(Stream.map((v) => String(v))))
    yield* bindProp(input, 'value', local.changes.pipe(Stream.map((v) => String(v))))

    const readout$ = local.changes.pipe(
      Stream.zipLatest(head$),
      Stream.map(([cur, max]) => `${cur}/${max}`),
    )
    yield* bindText(readout, readout$)

    const inputEvents$ = fromEvent(input, 'input').pipe(Stream.map(() => parseRangeValue(input)))

    yield* Effect.forkScoped(
      Stream.runForEach(inputEvents$, (value) => SubscriptionRef.set(local, value)),
    )

    yield* Effect.forkScoped(
      Stream.runForEach(inputEvents$.pipe(Stream.debounce(SCRUB_DEBOUNCE)), (value) =>
        params.onScrub(value),
      ),
    )

    const beginScrub$ = Stream.merge(
      fromEvent(input, 'pointerdown'),
      fromEvent(input, 'touchstart'),
    )
    yield* Effect.forkScoped(Stream.runForEach(beginScrub$, () => params.onBeginScrub()))

    const endScrub$ = Stream.merge(fromEvent(input, 'pointerup'), fromEvent(input, 'touchend'))
    yield* Effect.forkScoped(Stream.runForEach(endScrub$, () => params.onEndScrub()))

    yield* mount(parent, root)
  })
