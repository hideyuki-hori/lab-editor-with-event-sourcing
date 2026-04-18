import { Chunk, Effect, Stream } from 'effect'

export const fromEvent = <K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  type: K,
  options?: AddEventListenerOptions,
): Stream.Stream<HTMLElementEventMap[K]> =>
  Stream.async<HTMLElementEventMap[K]>((emit) => {
    const listener = (event: HTMLElementEventMap[K]): void => {
      void emit(Effect.succeed(Chunk.of(event)))
    }
    el.addEventListener(type, listener, options)
    return Effect.sync(() => {
      el.removeEventListener(type, listener, options)
    })
  })
