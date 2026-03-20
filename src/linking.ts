import type { ParsedURL, URLListener } from './linking.types.js'

declare const lynx: { getJSModule(id: string): { addListener(e: string, fn: (ev: { payload?: string }) => void): void; removeListener?(e: string, fn: (ev: { payload?: string }) => void): void } }

let urlSubscription: { remove?: () => void } | null = null

export function createURL(path = '', options: { scheme?: string; path?: string; queryParams?: Record<string, string> } = {}): string {
  const mod = NativeModules?.LinkingModule
  if (!mod?.createURL) {
    const scheme = options.scheme ?? 'tamerdevapp'
    const p = options.path ?? path
    const qs = options.queryParams
      ? '?' + Object.entries(options.queryParams).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
      : ''
    return `${scheme}://${p}`.replace(/\/$/, '') + qs
  }
  const opts = { scheme: options.scheme ?? 'tamerdevapp', path: options.path ?? path, queryParams: options.queryParams ?? {} }
  return mod.createURL(path, JSON.stringify(opts))
}

export function getInitialURL(): Promise<string | null> {
  return new Promise((resolve) => {
    const mod = NativeModules?.LinkingModule
    if (!mod?.getInitialURL) {
      resolve(null)
      return
    }
    mod.getInitialURL((url: string | null) => resolve(url))
  })
}

export function addEventListener(type: 'url', listener: URLListener): { remove: () => void } {
  if (type !== 'url') return { remove: () => {} }
  const bridge = typeof lynx !== 'undefined' ? lynx?.getJSModule?.('GlobalEventEmitter') : undefined
  if (!bridge?.addListener) return { remove: () => {} }
  const handler = (ev: { payload?: string }) => {
    try {
      const data = ev?.payload ? JSON.parse(ev.payload) : ev
      if (data?.url) listener({ url: data.url })
    } catch {
      /* ignore */
    }
  }
  bridge.addListener('tamer-linking:url', handler)
  const sub = {
    remove: () => {
      bridge?.removeListener?.('tamer-linking:url', handler)
      urlSubscription = null
    },
  }
  urlSubscription = sub
  return sub
}

export function removeEventListener(type: 'url', listener: URLListener): void {
  urlSubscription?.remove?.()
}
