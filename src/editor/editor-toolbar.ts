import { Effect, Option, type Scope, Stream, SubscriptionRef } from 'effect'
import { bindAttr, bindShow, bindText, fromEvent, h, mount } from '~/ui'

export type EditorStatus = 'idle' | 'saving' | 'saved' | 'error'

const disabledAttr$ = (s: Stream.Stream<boolean>): Stream.Stream<Option.Option<string>> =>
  s.pipe(Stream.map((flag) => (flag ? Option.some('true') : Option.none())))

export const editorToolbar = (
  parent: Element,
  params: {
    selectedId$: Stream.Stream<Option.Option<string>>
    branchName$: Stream.Stream<Option.Option<string>>
    currentVersion$: Stream.Stream<number>
    headVersion$: Stream.Stream<number>
    isPreview$: Stream.Stream<boolean>
    status$: Stream.Stream<EditorStatus>
    undoSize$: Stream.Stream<number>
    redoSize$: Stream.Stream<number>
    onJumpTo: (version: number) => Effect.Effect<void>
    onUndo: () => Effect.Effect<void>
    onRedo: () => Effect.Effect<void>
  },
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const currentVersionRef = yield* SubscriptionRef.make(0)

    yield* Stream.runForEach(params.currentVersion$, (v) =>
      SubscriptionRef.set(currentVersionRef, v),
    ).pipe(Effect.forkScoped)

    const hasSelected$ = params.selectedId$.pipe(Stream.map(Option.isSome))
    const hasBranch$ = params.branchName$.pipe(Stream.map(Option.isSome))

    const root = h('div', { class: 'mb-3 flex flex-wrap items-center gap-3 text-xs' })

    const idEl = h('span', { class: 'text-gray-500' })
    const branchEl = h('span', { class: 'rounded bg-gray-100 px-2 py-0.5 text-gray-700' })
    const versionEl = h('span', { class: 'text-gray-500' })

    const navWrap = h('div', { class: 'flex items-center gap-1' })
    const prevBtn = h('button', {
      class: 'rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40',
    })
    prevBtn.type = 'button'
    prevBtn.textContent = '\u2190'
    const nextBtn = h('button', {
      class: 'rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40',
    })
    nextBtn.type = 'button'
    nextBtn.textContent = '\u2192'
    navWrap.append(prevBtn, nextBtn)

    const jumpWrap = h('div', { class: 'flex items-center gap-1' })
    const undoBtn = h('button', {
      class: 'rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40',
      title: 'ジャンプを取り消し',
    })
    undoBtn.type = 'button'
    const redoBtn = h('button', {
      class: 'rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40',
      title: 'ジャンプをやり直し',
    })
    redoBtn.type = 'button'
    jumpWrap.append(undoBtn, redoBtn)

    const previewEl = h(
      'span',
      {
        class: 'rounded bg-yellow-100 px-2 py-0.5 text-yellow-800',
        title: '編集を開始すると新ブランチに自動fork',
      },
      ['preview'],
    )

    const savingEl = h('span', { class: 'text-gray-500' }, ['saving...'])
    const savedEl = h('span', { class: 'text-green-600' }, ['saved'])
    const errorEl = h('span', { class: 'text-red-600' }, ['error'])

    root.append(idEl, branchEl, versionEl, navWrap, jumpWrap, previewEl, savingEl, savedEl, errorEl)

    yield* bindShow(idEl, hasSelected$)
    yield* bindText(
      idEl,
      params.selectedId$.pipe(
        Stream.map(Option.match({ onNone: () => '', onSome: (v) => `id: ${v}` })),
      ),
    )

    yield* bindShow(branchEl, hasBranch$)
    yield* bindText(
      branchEl,
      params.branchName$.pipe(
        Stream.map(Option.match({ onNone: () => '', onSome: (v) => `@ ${v}` })),
      ),
    )

    yield* bindShow(versionEl, hasSelected$)
    yield* bindText(
      versionEl,
      Stream.zipLatest(params.currentVersion$, params.headVersion$).pipe(
        Stream.map(([cur, head]) => `v${cur} / ${head}`),
      ),
    )

    yield* bindShow(navWrap, hasSelected$)
    yield* bindAttr(
      prevBtn,
      'disabled',
      disabledAttr$(params.currentVersion$.pipe(Stream.map((v) => v <= 0))),
    )
    yield* bindAttr(
      nextBtn,
      'disabled',
      disabledAttr$(
        Stream.zipLatest(params.currentVersion$, params.headVersion$).pipe(
          Stream.map(([cur, head]) => cur >= head),
        ),
      ),
    )

    yield* bindShow(jumpWrap, hasSelected$)
    yield* bindText(undoBtn, params.undoSize$.pipe(Stream.map((n) => `\u21B6 jump-undo (${n})`)))
    yield* bindText(redoBtn, params.redoSize$.pipe(Stream.map((n) => `\u21B7 jump-redo (${n})`)))
    yield* bindAttr(
      undoBtn,
      'disabled',
      disabledAttr$(params.undoSize$.pipe(Stream.map((n) => n === 0))),
    )
    yield* bindAttr(
      redoBtn,
      'disabled',
      disabledAttr$(params.redoSize$.pipe(Stream.map((n) => n === 0))),
    )

    yield* bindShow(previewEl, params.isPreview$)
    yield* bindShow(savingEl, params.status$.pipe(Stream.map((s) => s === 'saving')))
    yield* bindShow(savedEl, params.status$.pipe(Stream.map((s) => s === 'saved')))
    yield* bindShow(errorEl, params.status$.pipe(Stream.map((s) => s === 'error')))

    yield* fromEvent(prevBtn, 'click').pipe(
      Stream.runForEach(() =>
        Effect.gen(function* () {
          const cur = yield* SubscriptionRef.get(currentVersionRef)
          yield* params.onJumpTo(cur - 1)
        }),
      ),
      Effect.forkScoped,
    )

    yield* fromEvent(nextBtn, 'click').pipe(
      Stream.runForEach(() =>
        Effect.gen(function* () {
          const cur = yield* SubscriptionRef.get(currentVersionRef)
          yield* params.onJumpTo(cur + 1)
        }),
      ),
      Effect.forkScoped,
    )

    yield* fromEvent(undoBtn, 'click').pipe(
      Stream.runForEach(() => params.onUndo()),
      Effect.forkScoped,
    )

    yield* fromEvent(redoBtn, 'click').pipe(
      Stream.runForEach(() => params.onRedo()),
      Effect.forkScoped,
    )

    yield* mount(parent, root)
  })
