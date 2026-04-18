import { Effect } from 'effect'
import { useEffect, useRef } from 'react'
import type { StepsAppliedPayload } from '~/domain/schema/steps-applied-payload'
import { SubscribeStepsApplied } from '~/domain/usecase/subscribe-steps-applied'
import { useRunPromise } from '~/react-effect'

export function useStepsApplied(handler: (payload: StepsAppliedPayload) => void) {
  const runPromise = useRunPromise()
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    const program = Effect.gen(function* () {
      const subscribe = yield* SubscribeStepsApplied
      return yield* subscribe((payload) => handlerRef.current(payload))
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
