import type { Editor, JSONContent } from '@tiptap/core'
import { Step } from '@tiptap/pm/transform'
import { Effect, type Layer, Option, Ref, type Scope, Stream, SubscriptionRef } from 'effect'
import type { Branch } from '~/domain/schema/branch'
import type { EventInput } from '~/domain/schema/event-input'
import type { LoadedPage } from '~/domain/schema/loaded-page'
import type { StepsAppliedPayload } from '~/domain/schema/steps-applied-payload'
import {
  CreateBranch,
  ListBranches,
  LoadPage,
  RestoreToVersion,
  SubscribeStepsApplied,
  SwitchBranch,
} from '~/domain/usecase'
import { branchTree } from '~/editor/branch-tree'
import { createEditor, type EditorCore, type TransactionPayload } from '~/editor/editor-instance'
import type { EditorStatus } from '~/editor/editor-toolbar'
import { editorToolbar } from '~/editor/editor-toolbar'
import { historySlider } from '~/editor/history-slider'
import { jumpHistory as createJumpHistory } from '~/editor/jump-history'
import { EMPTY_CONTENT } from '~/editor/lib/empty-content'
import { previewTitle } from '~/editor/lib/preview-title'
import { tailVersionOf } from '~/editor/lib/tail-version'
import { snapshotScheduler } from '~/editor/snapshot-scheduler'
import { stepPipeline } from '~/editor/step-pipeline'
import type { AppLayer } from '~/runtime'
import { bindWhen, h, mount } from '~/ui'

const FLUSH_DEBOUNCE_MS = 400

type AppR = Layer.Layer.Success<typeof AppLayer>

const applyRestoredDoc = (
  editor: Editor,
  snapshotState: Option.Option<string>,
  events: readonly { payload: string }[],
): void => {
  const base: JSONContent = Option.match(snapshotState, {
    onNone: () => EMPTY_CONTENT,
    onSome: (state) => JSON.parse(state),
  })
  editor.commands.setContent(base)
  for (const ev of events) {
    const step = Step.fromJSON(editor.schema, JSON.parse(ev.payload))
    const tr = editor.state.tr.step(step)
    editor.view.dispatch(tr)
  }
}

const subscribeStepsApplied$ = (
  subscribe: (handler: (payload: StepsAppliedPayload) => void) => Effect.Effect<() => void>,
): Stream.Stream<StepsAppliedPayload> =>
  Stream.asyncPush<StepsAppliedPayload>((emit) =>
    Effect.acquireRelease(
      subscribe((payload) => {
        emit.single(payload)
      }),
      (unsubscribe) => Effect.sync(() => unsubscribe()),
    ),
  )

export const editor = (
  parent: Element,
  params: {
    readonly selectedId$: Stream.Stream<Option.Option<string>>
  },
): Effect.Effect<void, never, Scope.Scope | AppR> =>
  Effect.gen(function* () {
    const loadPage = yield* LoadPage
    const listBranches = yield* ListBranches
    const createBranch = yield* CreateBranch
    const restoreToVersion = yield* RestoreToVersion
    const switchBranch = yield* SwitchBranch
    const subscribeSteps = yield* SubscribeStepsApplied

    const status$ = yield* SubscriptionRef.make<EditorStatus>('idle')
    const branchId$ = yield* SubscriptionRef.make<Option.Option<string>>(Option.none())
    const branchName$ = yield* SubscriptionRef.make<Option.Option<string>>(Option.none())
    const headVersion$ = yield* SubscriptionRef.make(0)
    const previewVersion$ = yield* SubscriptionRef.make<Option.Option<number>>(Option.none())
    const branches$ = yield* SubscriptionRef.make<readonly Branch[]>([])

    const versionRef = yield* Ref.make(0)
    const currentPageIdRef = yield* Ref.make<Option.Option<string>>(Option.none())
    const currentBranchIdRef = yield* Ref.make<Option.Option<string>>(Option.none())
    const loadingRef = yield* Ref.make(false)
    const forkingRef = yield* Ref.make(false)
    const scrubStartRef = yield* Ref.make<Option.Option<number>>(Option.none())
    const editorRef = yield* Ref.make<Option.Option<EditorCore>>(Option.none())

    const jumpHistory = yield* createJumpHistory()

    const currentVersion$ = Stream.zipLatest(previewVersion$.changes, headVersion$.changes).pipe(
      Stream.map(([preview, head]) => Option.getOrElse(preview, () => head)),
    )
    const isPreview$ = previewVersion$.changes.pipe(Stream.map(Option.isSome))

    const stepsApplied$ = subscribeStepsApplied$(subscribeSteps)

    const section = h('section', { class: 'flex-1 p-8' })
    yield* mount(parent, section)

    const toolbarSlot = h('div')
    const sliderSlot = h('div')
    const branchSlot = h('div')
    section.append(toolbarSlot, sliderSlot, branchSlot)

    const core = yield* createEditor({ initial: EMPTY_CONTENT })
    yield* Ref.set(editorRef, Option.some(core))
    yield* mount(section, core.view)

    const updatePreview = (version: Option.Option<number>): Effect.Effect<void> =>
      SubscriptionRef.set(previewVersion$, version)

    const resetForNoSelection: Effect.Effect<void> = Effect.gen(function* () {
      yield* Ref.set(loadingRef, true)
      yield* Effect.try(() => core.setContent(EMPTY_CONTENT)).pipe(
        Effect.ensuring(Ref.set(loadingRef, false)),
        Effect.catchAll(() => Effect.void),
      )
      yield* Ref.set(versionRef, 0)
      yield* SubscriptionRef.set(headVersion$, 0)
      yield* SubscriptionRef.set(branchId$, Option.none())
      yield* SubscriptionRef.set(branchName$, Option.none())
      yield* SubscriptionRef.set(branches$, [])
      yield* SubscriptionRef.set(status$, 'idle')
    })

    const scheduler = yield* snapshotScheduler({
      getBranchId: () => Ref.get(currentBranchIdRef),
      getDoc: () =>
        Effect.gen(function* () {
          const ed = yield* Ref.get(editorRef)
          return Option.map(ed, (e) => e.getJSON())
        }),
      stepsApplied$,
      initialVersion: 0,
    })

    const adoptLoaded = (loaded: LoadedPage): Effect.Effect<void> =>
      Effect.gen(function* () {
        const snapshot = Option.fromNullable(loaded.snapshot)
        const branchName = Option.fromNullable(loaded.branch.name)
        yield* Ref.set(currentBranchIdRef, Option.some(loaded.branch.id))
        yield* SubscriptionRef.set(branchId$, Option.some(loaded.branch.id))
        yield* SubscriptionRef.set(
          branchName$,
          Option.some(Option.getOrElse(branchName, () => loaded.branch.id.slice(0, 8))),
        )
        yield* Ref.set(loadingRef, true)
        yield* Effect.try(() =>
          applyRestoredDoc(
            core.instance,
            Option.map(snapshot, (s) => s.state),
            loaded.events.map((e) => ({ payload: e.payload })),
          ),
        ).pipe(
          Effect.ensuring(Ref.set(loadingRef, false)),
          Effect.tapError((err) => Effect.logError(err)),
          Effect.catchAll(() => Effect.void),
        )
        const tail = tailVersionOf(loaded)
        yield* Ref.set(versionRef, tail)
        yield* SubscriptionRef.set(headVersion$, tail)
        yield* scheduler.setLastVersion(
          Option.getOrElse(
            Option.map(snapshot, (s) => s.version),
            () => 0,
          ),
        )
        yield* updatePreview(Option.none())
      })

    const pipelineEmit = yield* stepPipeline({
      debounceMs: FLUSH_DEBOUNCE_MS,
      getContext: () =>
        Effect.gen(function* () {
          const pageId = yield* Ref.get(currentPageIdRef)
          const branch = yield* Ref.get(currentBranchIdRef)
          const ed = yield* Ref.get(editorRef)
          if (Option.isNone(pageId) || Option.isNone(branch) || Option.isNone(ed)) {
            return Option.none()
          }
          const version = yield* Ref.get(versionRef)
          return Option.some({
            pageId: pageId.value,
            branchId: branch.value,
            version,
            title: previewTitle(ed.value.getJSON()),
          })
        }),
      onSaving: SubscriptionRef.set(status$, 'saving'),
      onSaved: (newVersion) =>
        Effect.gen(function* () {
          yield* Ref.set(versionRef, newVersion)
          yield* SubscriptionRef.set(headVersion$, newVersion)
          yield* SubscriptionRef.set(status$, 'saved')
        }),
      onError: (err) =>
        Effect.gen(function* () {
          yield* Effect.logError(err)
          yield* SubscriptionRef.set(status$, 'error')
        }),
    })

    const refreshBranches = (pageId: string): Effect.Effect<void> =>
      listBranches(pageId).pipe(
        Effect.flatMap((result) => SubscriptionRef.set(branches$, result)),
        Effect.tapError((err) => Effect.logError(err)),
        Effect.catchAll(() => Effect.void),
      )

    const beginAutoFork = (
      pageId: string,
      parentBranchId: string,
      stepEvents: readonly EventInput[],
    ): Effect.Effect<void> =>
      Effect.gen(function* () {
        const targetOpt = yield* SubscriptionRef.get(previewVersion$)
        if (Option.isNone(targetOpt)) return
        const target = targetOpt.value
        yield* Ref.set(forkingRef, true)
        core.setEditable(false)
        yield* createBranch(pageId, parentBranchId, target, undefined).pipe(
          Effect.flatMap((created) =>
            Effect.gen(function* () {
              const createdName = Option.fromNullable(created.name)
              yield* Ref.set(currentBranchIdRef, Option.some(created.id))
              yield* SubscriptionRef.set(branchId$, Option.some(created.id))
              yield* SubscriptionRef.set(
                branchName$,
                Option.some(Option.getOrElse(createdName, () => created.id.slice(0, 8))),
              )
              yield* Ref.set(versionRef, target)
              yield* SubscriptionRef.set(headVersion$, target)
              yield* scheduler.setLastVersion(target)
              yield* updatePreview(Option.none())
              yield* jumpHistory.clear
              yield* pipelineEmit({ events: stepEvents, pageId, branchId: created.id })
            }),
          ),
          Effect.tapError((err) =>
            Effect.gen(function* () {
              yield* Effect.logError(err)
              yield* SubscriptionRef.set(status$, 'error')
            }),
          ),
          Effect.ensuring(
            Effect.gen(function* () {
              core.setEditable(true)
              yield* Ref.set(forkingRef, false)
            }),
          ),
          Effect.catchAll(() => Effect.void),
        )
      })

    const onTransaction = (payload: TransactionPayload): Effect.Effect<void> =>
      Effect.gen(function* () {
        const loading = yield* Ref.get(loadingRef)
        if (loading) return
        const forking = yield* Ref.get(forkingRef)
        if (forking) return
        if (!payload.docChanged) return
        const pageId = yield* Ref.get(currentPageIdRef)
        const branch = yield* Ref.get(currentBranchIdRef)
        if (Option.isNone(pageId) || Option.isNone(branch)) return
        const stepEvents: EventInput[] = payload.stepsJson.map((s) => ({
          kind: 'StepApplied',
          payload: JSON.stringify(s),
        }))
        if (stepEvents.length === 0) return
        const preview = yield* SubscriptionRef.get(previewVersion$)
        if (Option.isSome(preview)) {
          yield* beginAutoFork(pageId.value, branch.value, stepEvents)
          return
        }
        yield* pipelineEmit({ events: stepEvents, pageId: pageId.value, branchId: branch.value })
      })

    yield* Effect.forkScoped(Stream.runForEach(core.transactions$, onTransaction))

    const applyJump = (version: number): Effect.Effect<void> =>
      Effect.gen(function* () {
        const branch = yield* Ref.get(currentBranchIdRef)
        if (Option.isNone(branch)) return
        const head = yield* SubscriptionRef.get(headVersion$)
        if (version < 0 || version > head) return
        yield* restoreToVersion(branch.value, version).pipe(
          Effect.flatMap((result) =>
            Effect.gen(function* () {
              const snapshot = Option.fromNullable(result.snapshot)
              yield* Ref.set(loadingRef, true)
              yield* Effect.try(() =>
                applyRestoredDoc(
                  core.instance,
                  Option.map(snapshot, (s) => s.state),
                  result.events.map((e) => ({ payload: e.payload })),
                ),
              ).pipe(Effect.ensuring(Ref.set(loadingRef, false)))
              yield* updatePreview(version === head ? Option.none() : Option.some(version))
            }),
          ),
          Effect.tapError((err) =>
            Effect.gen(function* () {
              yield* Effect.logError(err)
              yield* SubscriptionRef.set(status$, 'error')
            }),
          ),
          Effect.ensuring(Ref.set(loadingRef, false)),
          Effect.catchAll(() => Effect.void),
        )
      })

    const recordJump = (fromVersion: number, toVersion: number): Effect.Effect<void> =>
      Effect.gen(function* () {
        const branch = yield* Ref.get(currentBranchIdRef)
        if (Option.isNone(branch) || fromVersion === toVersion) return
        yield* jumpHistory.push({
          from: { branchId: branch.value, version: fromVersion },
          to: { branchId: branch.value, version: toVersion },
        })
      })

    const jumpTo = (version: number): Effect.Effect<void> =>
      Effect.gen(function* () {
        const preview = yield* SubscriptionRef.get(previewVersion$)
        const head = yield* SubscriptionRef.get(headVersion$)
        const fromVersion = Option.getOrElse(preview, () => head)
        yield* recordJump(fromVersion, version)
        yield* applyJump(version)
      })

    const undoJump: Effect.Effect<void> = Effect.gen(function* () {
      const entry = yield* jumpHistory.popUndo
      if (Option.isNone(entry)) return
      yield* applyJump(entry.value.from.version)
    })

    const redoJump: Effect.Effect<void> = Effect.gen(function* () {
      const entry = yield* jumpHistory.popRedo
      if (Option.isNone(entry)) return
      yield* applyJump(entry.value.to.version)
    })

    const beginScrub: Effect.Effect<void> = Effect.gen(function* () {
      const preview = yield* SubscriptionRef.get(previewVersion$)
      const head = yield* SubscriptionRef.get(headVersion$)
      yield* Ref.set(scrubStartRef, Option.some(Option.getOrElse(preview, () => head)))
    })

    const scrubTo = (version: number): Effect.Effect<void> => applyJump(version)

    const endScrub: Effect.Effect<void> = Effect.gen(function* () {
      const from = yield* Ref.get(scrubStartRef)
      const preview = yield* SubscriptionRef.get(previewVersion$)
      const head = yield* SubscriptionRef.get(headVersion$)
      const to = Option.getOrElse(preview, () => head)
      yield* Ref.set(scrubStartRef, Option.none())
      if (Option.isSome(from)) yield* recordJump(from.value, to)
    })

    const handleBranchSelect = (target: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const pageId = yield* Ref.get(currentPageIdRef)
        if (Option.isNone(pageId)) return
        const currentBranch = yield* Ref.get(currentBranchIdRef)
        if (Option.isSome(currentBranch) && target === currentBranch.value) return
        yield* switchBranch(pageId.value, target).pipe(
          Effect.flatMap((loaded) =>
            Effect.gen(function* () {
              yield* adoptLoaded(loaded)
              yield* jumpHistory.clear
            }),
          ),
          Effect.tapError((err) =>
            Effect.gen(function* () {
              yield* Effect.logError(err)
              yield* SubscriptionRef.set(status$, 'error')
            }),
          ),
          Effect.catchAll(() => Effect.void),
        )
      })

    const doLoadPage = (id: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* loadPage(id).pipe(
          Effect.flatMap((loaded) =>
            Effect.gen(function* () {
              yield* adoptLoaded(loaded)
              yield* SubscriptionRef.set(status$, 'idle')
            }),
          ),
          Effect.tapError((err) =>
            Effect.gen(function* () {
              yield* Effect.logError(err)
              yield* SubscriptionRef.set(status$, 'error')
            }),
          ),
          Effect.ensuring(Ref.set(loadingRef, false)),
          Effect.catchAll(() => Effect.void),
        )
        yield* refreshBranches(id)
      })

    const onSelectedIdChange = (selectedId: Option.Option<string>): Effect.Effect<void> =>
      Effect.gen(function* () {
        yield* Ref.set(currentPageIdRef, selectedId)
        yield* Ref.set(currentBranchIdRef, Option.none())
        yield* updatePreview(Option.none())
        yield* jumpHistory.clear
        if (Option.isNone(selectedId)) {
          yield* resetForNoSelection
          yield* scheduler.setLastVersion(0)
          return
        }
        yield* doLoadPage(selectedId.value)
      })

    yield* Effect.forkScoped(
      params.selectedId$.pipe(
        Stream.flatMap((id) => Stream.fromEffect(onSelectedIdChange(id)), { switch: true }),
        Stream.runDrain,
      ),
    )

    yield* editorToolbar(toolbarSlot, {
      selectedId$: params.selectedId$,
      branchName$: branchName$.changes,
      currentVersion$,
      headVersion$: headVersion$.changes,
      isPreview$,
      status$: status$.changes,
      undoSize$: jumpHistory.undoSize$,
      redoSize$: jumpHistory.redoSize$,
      onJumpTo: jumpTo,
      onUndo: () => undoJump,
      onRedo: () => redoJump,
    })

    yield* bindWhen(sliderSlot, params.selectedId$, () =>
      Effect.gen(function* () {
        const wrapper = h('div', { class: 'mb-3' })
        yield* historySlider(wrapper, {
          current$: currentVersion$,
          head$: headVersion$.changes,
          onBeginScrub: () => beginScrub,
          onScrub: scrubTo,
          onEndScrub: () => endScrub,
        })
        return wrapper
      }),
    )

    const shouldShowBranches$ = Stream.zipLatest(params.selectedId$, branchId$.changes).pipe(
      Stream.map(([sel, br]) =>
        Option.isSome(sel) && Option.isSome(br) ? Option.some(true) : Option.none(),
      ),
    )
    yield* bindWhen(branchSlot, shouldShowBranches$, () =>
      Effect.gen(function* () {
        const wrapper = h('div', { class: 'mb-4' })
        yield* branchTree(wrapper, {
          branches$: branches$.changes,
          currentBranchId$: branchId$.changes,
          onSelect: handleBranchSelect,
        })
        return wrapper
      }),
    )
  })
