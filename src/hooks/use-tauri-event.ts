import { listen } from '@tauri-apps/api/event'
import { useEffect, useRef } from 'react'

export function useTauriEvent<P>(event: string, handler: (payload: P) => void) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  useEffect(() => {
    const unlistenPromise = listen<P>(event, (e) => handlerRef.current(e.payload))
    return () => {
      unlistenPromise.then((fn) => fn())
    }
  }, [event])
}
