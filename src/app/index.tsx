import { Effect } from 'effect'
import { useCallback, useEffect, useState } from 'react'
import { PageList } from '~/app/page-list'
import type { Page } from '~/domain/schema/page'
import { CreatePage, ListPages } from '~/domain/usecase'
import { Editor } from '~/editor'
import { usePagesChanged } from '~/hooks/use-pages-changed'
import { useRunPromise } from '~/react-effect'

export function App() {
  const [pages, setPages] = useState<readonly Page[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const runPromise = useRunPromise()

  const refresh = useCallback(() => {
    const program = Effect.gen(function* () {
      const listPages = yield* ListPages
      const result = yield* listPages()
      setPages(result)
    })
    return runPromise(program).catch(console.error)
  }, [runPromise])

  useEffect(() => {
    refresh()
  }, [refresh])

  usePagesChanged(refresh)

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
