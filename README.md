# tamer-linking

Deep linking and URL creation for Lynx.

## Installation

```bash
npm install @tamer4lynx/tamer-linking
```

Add to your app's dependencies and run `t4l link`.

## Usage

```ts
import {
  createURL,
  getInitialURL,
  addEventListener,
  removeEventListener,
  type ParsedURL,
  type URLListener,
} from '@tamer4lynx/tamer-linking'

// Create deep link URL
const url = createURL('auth/callback', {
  scheme: 'myapp',
  path: 'auth/callback',
  queryParams: { code: 'abc', state: 'xyz' },
})

// Get URL that launched the app
const initialUrl = await getInitialURL()

// Listen for incoming URLs (e.g. OAuth redirect)
const subscription = addEventListener('url', (event: { url: string }) => {
  console.log('Received URL:', event.url)
})
subscription.remove()
```

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `createURL(path?, options?)` | `string` | Build deep link. Options: `scheme`, `path`, `queryParams` |
| `getInitialURL()` | `Promise<string \| null>` | URL that launched the app |
| `addEventListener(type, listener)` | `{ remove: () => void }` | Listen for `url` events |
| `removeEventListener(type, listener)` | `void` | Remove listener |

**Types:** `ParsedURL`, `URLListener`

## Android OAuth (`tamerdevapp://`)

When this package is autolinked, **`t4l link android`** merges a default deep link for scheme **`tamerdevapp`** into `AndroidManifest.xml` (inside `.ProjectActivity`, between `<!-- GENERATED DEEP LINKS START/END -->`). That matches the default `makeRedirectUri()` / `tamer-auth` OAuth callback. You can add or override schemes via `android.deepLinks` in **`tamer.config.json`** (see [tamer-plugin](https://tamer4lynx.github.io/packages/core/tamer-plugin.md) / host config).

## Platform

Uses **lynx.ext.json**. Run `t4l link` after adding to your app.
