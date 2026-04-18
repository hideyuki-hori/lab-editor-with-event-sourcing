import { Effect, Option, type Scope, Stream } from 'effect'
import type { Branch } from '~/domain/schema/branch'
import { buildBranchTree } from '~/editor/lib/build-branch-tree'
import type { BranchNode } from '~/editor/types/branch-node'
import { bindClass, bindList, bindShow, fromEvent, h, mount } from '~/ui'

type Ancestor = { readonly branchId: string; readonly hasMore: boolean }

type FlatRow = {
  readonly node: BranchNode
  readonly depth: number
  readonly isLast: boolean
  readonly ancestors: readonly Ancestor[]
}

const flatten = (roots: readonly BranchNode[]): readonly FlatRow[] => {
  const out: FlatRow[] = []
  const walk = (
    nodes: readonly BranchNode[],
    depth: number,
    ancestors: readonly Ancestor[],
  ): void => {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i]
      const isLast = i === nodes.length - 1
      out.push({ node, depth, isLast, ancestors })
      const childAncestors: readonly Ancestor[] = [
        ...ancestors,
        { branchId: node.branch.id, hasMore: !isLast },
      ]
      walk(node.children, depth + 1, childAncestors)
    }
  }
  walk(roots, 0, [])
  return out
}

const renderRow = (
  row: FlatRow,
  currentBranchId$: Stream.Stream<Option.Option<string>>,
  onSelect: (branchId: string) => Effect.Effect<void>,
): Effect.Effect<HTMLElement, never, Scope.Scope> =>
  Effect.gen(function* () {
    const { node, depth, isLast, ancestors } = row
    const label = Option.getOrElse(Option.fromNullable(node.branch.name), () =>
      node.branch.id.slice(0, 8),
    )
    const forkInfo = Option.match(Option.fromNullable(node.branch.parentBranchId), {
      onNone: () => '',
      onSome: () => ` (v${node.branch.forkVersion})`,
    })

    const guides = ancestors.map((a) =>
      h('span', { class: 'inline-block w-4 text-gray-300' }, [a.hasMore ? '│' : ' ']),
    )
    const connector =
      depth === 0
        ? h('span', { class: 'inline-block w-4 text-gray-400' }, ['●'])
        : h('span', { class: 'inline-block w-4 text-gray-400' }, [isLast ? '└─' : '├─'])

    const button = h('button', { class: 'ml-1 rounded px-2 py-0.5 font-sans' }, [
      `${label}${forkInfo}`,
    ])
    button.type = 'button'

    const headerRow = h('div', { class: 'flex items-center font-mono' }, [
      ...guides,
      connector,
      button,
    ])

    const wrapper = h('div', {}, [headerRow])

    const active$ = currentBranchId$.pipe(
      Stream.map(
        Option.match({
          onNone: () => false,
          onSome: (id) => id === node.branch.id,
        }),
      ),
    )
    const inactive$ = active$.pipe(Stream.map((v) => !v))

    yield* bindClass(button, 'bg-black', active$)
    yield* bindClass(button, 'text-white', active$)
    yield* bindClass(button, 'border', inactive$)
    yield* bindClass(button, 'border-gray-300', inactive$)
    yield* bindClass(button, 'text-gray-700', inactive$)
    yield* bindClass(button, 'hover:bg-gray-100', inactive$)

    const clicks = fromEvent(button, 'click').pipe(
      Stream.runForEach(() => onSelect(node.branch.id)),
    )
    yield* Effect.forkScoped(clicks)

    return wrapper
  })

export const branchTree = (
  parent: Element,
  params: {
    branches$: Stream.Stream<readonly Branch[]>
    currentBranchId$: Stream.Stream<Option.Option<string>>
    onSelect: (branchId: string) => Effect.Effect<void>
  },
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const container = h('div', { class: 'flex flex-col gap-0.5 text-xs' })
    const heading = h('span', { class: 'text-gray-500' }, ['branches:'])
    const listEl = h('div', {})
    container.append(heading, listEl)

    yield* mount(parent, container)

    const visible$ = params.branches$.pipe(Stream.map((branches) => branches.length > 0))
    yield* bindShow(container, visible$)

    const rows$ = params.branches$.pipe(
      Stream.map((branches) => flatten(buildBranchTree(branches))),
    )

    yield* bindList(
      listEl,
      rows$,
      (row) => row.node.branch.id,
      (row) => renderRow(row, params.currentBranchId$, params.onSelect),
    )
  })
