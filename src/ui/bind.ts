import { Effect, Option, type Scope, Stream } from 'effect'

const subscribe = <A>(
  stream: Stream.Stream<A>,
  handle: (value: A) => void,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const scope = yield* Effect.scope
    const loop = Stream.runForEach(stream, (value) => Effect.sync(() => handle(value)))
    yield* Effect.forkIn(loop, scope)
  })

export const bindText = (
  el: Element,
  s: Stream.Stream<string>,
): Effect.Effect<void, never, Scope.Scope> =>
  subscribe(s, (value) => {
    el.textContent = value
  })

export const bindAttr = (
  el: Element,
  name: string,
  s: Stream.Stream<Option.Option<string>>,
): Effect.Effect<void, never, Scope.Scope> =>
  subscribe(s, (value) => {
    if (Option.isNone(value)) {
      el.removeAttribute(name)
      return
    }
    el.setAttribute(name, value.value)
  })

export const bindProp = <E extends HTMLElement, K extends keyof E>(
  el: E,
  name: K,
  s: Stream.Stream<E[K]>,
): Effect.Effect<void, never, Scope.Scope> =>
  subscribe(s, (value) => {
    el[name] = value
  })

export const bindClass = (
  el: Element,
  name: string,
  s: Stream.Stream<boolean>,
): Effect.Effect<void, never, Scope.Scope> =>
  subscribe(s, (value) => {
    el.classList.toggle(name, value)
  })

export const bindStyle = (
  el: HTMLElement,
  name: string,
  s: Stream.Stream<Option.Option<string>>,
): Effect.Effect<void, never, Scope.Scope> =>
  subscribe(s, (value) => {
    if (Option.isNone(value)) {
      el.style.removeProperty(name)
      return
    }
    el.style.setProperty(name, value.value)
  })

export const bindShow = (
  el: HTMLElement,
  s: Stream.Stream<boolean>,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    const initial = el.style.getPropertyValue('display')
    yield* subscribe(s, (visible) => {
      if (visible) {
        if (initial === '' || initial === 'none') {
          el.style.removeProperty('display')
          return
        }
        el.style.setProperty('display', initial)
        return
      }
      el.style.setProperty('display', 'none')
    })
  })
