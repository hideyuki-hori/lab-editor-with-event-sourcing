import { Effect } from 'effect'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '~/app'
import { runFork } from '~/lib/runtime'
import '~/styles/index.css'

const main = Effect.sync(() => {
  const container = document.getElementById('root')
  if (!container) throw new Error('root element not found')
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})

runFork(main)
