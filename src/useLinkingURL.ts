import { useEffect, useState } from '@lynx-js/react'
import { addEventListener, getInitialURL } from './linking.js'

export interface UseLinkingURLResult {
  url: string | null
}

export function useLinkingURL(): UseLinkingURLResult {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void getInitialURL().then((u) => {
      if (!cancelled && u != null) setUrl(u)
    })
    const sub = addEventListener('url', ({ url: next }) => {
      setUrl(next)
    })
    return () => {
      cancelled = true
      sub.remove()
    }
  }, [])

  return { url }
}
