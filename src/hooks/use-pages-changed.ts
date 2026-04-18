import { Effect } from 'effect'
import { useEffect, useRef } from 'react'
import { SubscribePagesChanged } from '~/domain/usecase/subscribe-pages-changed'
import { useRunPromise } from '~/react-effect'

export function usePagesChanged(handler: () => void) {
  const runPromise = useRunPromise()
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    const program = Effect.gen(function* () {
      const subscribe = yield* SubscribePagesChanged
      return yield* subscribe(() => handlerRef.current())
    })
    runPromise(program)
      .then((unsub) => {
        unsubscribe = unsub
      })
      .catch(console.error)
    return () => {
      unsubscribe?.()
    }
  }, [runPromise])
}
