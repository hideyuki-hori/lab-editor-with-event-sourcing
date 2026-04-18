import { Effect } from 'effect'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '~/app'
import { RuntimeProvider } from '~/react-effect'
import { makeRuntime } from '~/runtime'
import '~/styles/index.css'

const runtime = makeRuntime()

const main = Effect.sync(() => {
  const container = document.getElementById('root')
  if (!container) throw new Error('root element not found')
  createRoot(container).render(
    <StrictMode>
      <RuntimeProvider runtime={runtime}>
        <App />
      </RuntimeProvider>
    </StrictMode>,
  )
})

runtime.runFork(main)
