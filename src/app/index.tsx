import { Effect } from 'effect'
import { useCallback, useEffect, useState } from 'react'
import { PageList } from '~/app/page-list'
import type { Page } from '~/app/schema/page'
import { Editor } from '~/editor'
import { useTauriEvent } from '~/hooks/use-tauri-event'
import { runPromise } from '~/lib/runtime'
import { CreatePage } from '~/repositories/create-page/tag'
import { ListPages } from '~/repositories/list-pages/tag'

export function App() {
  const [pages, setPages] = useState<readonly Page[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refresh = useCallback(() => {
    const program = Effect.gen(function* () {
      const listPages = yield* ListPages
      const result = yield* listPages()
      setPages(result)
    })
    return runPromise(program).catch(console.error)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useTauriEvent<null>('pages_changed', refresh)

  const handleCreate = () => {
    const program = Effect.gen(function* () {
      const createPage = yield* CreatePage
      const page = yield* createPage('Untitled')
      setSelectedId(page.id)
    })
    runPromise(program).catch(console.error)
  }

  return (
    <main className='flex h-screen'>
      <PageList
        pages={pages}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
      />
      <Editor selectedId={selectedId} />
    </main>
  )
}
