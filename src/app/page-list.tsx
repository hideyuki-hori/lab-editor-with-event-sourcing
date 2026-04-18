import type { Page } from '~/domain/schema/page'

type Props = {
  pages: readonly Page[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
}

export function PageList({ pages, selectedId, onSelect, onCreate }: Props) {
  return (
    <aside className='w-64 border-r border-gray-200 p-4'>
      <button
        type='button'
        onClick={onCreate}
        className='w-full rounded bg-black px-3 py-1 text-sm text-white'
      >
        + New
      </button>
      <ul className='mt-4 space-y-1'>
        {pages.map((p) => {
          const active = p.id === selectedId
          const title = p.title.length > 0 ? p.title : 'Untitled'
          return (
            <li key={p.id}>
              <button
                type='button'
                onClick={() => onSelect(p.id)}
                className={`w-full truncate rounded px-2 py-1 text-left text-sm ${
                  active ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                }`}
              >
                {title}
              </button>
            </li>
          )
        })}
        {pages.length === 0 && <li className='px-2 text-xs text-gray-400'>no pages</li>}
      </ul>
    </aside>
  )
}
