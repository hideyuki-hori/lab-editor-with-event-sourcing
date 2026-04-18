import { Effect } from 'effect'
import { app } from '~/app'
import { makeRuntime } from '~/runtime'
import '~/styles/index.css'

const runtime = makeRuntime()

const program = Effect.gen(function* () {
  const container = document.getElementById('root')
  if (!container) return yield* Effect.die(new Error('root element not found'))
  yield* app(container)
  yield* Effect.never
}).pipe(Effect.scoped)

runtime.runPromise(program).catch((err) => {
  console.error('App failed:', err)
})
