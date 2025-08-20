# Cookie State

[![Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://cookie-state.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A minimal React library for state management using cookies with full TypeScript support.

## 🚀 [**Live Demo**](https://cookie-state.vercel.app/)

Try the interactive demo to see the library in action with real cookie storage, TypeScript support, and cross-domain functionality.

## Installation

```bash
npm install cookie-state
```

## Usage

> 💡 **See it in action**: Check out the [**live demo**](https://cookie-state.vercel.app/) with interactive examples!

```tsx
import { useCookieState, type CookieOptions } from 'cookie-state'

// TypeScript interface for your data
interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'en' | 'es'
  notifications: boolean
}

function MyComponent() {
  // Simple counter with TypeScript support
  const { value: count, setValue: setCount, deleteValue: removeCount } = useCookieState<number>('count', 0, {
    domain: '.example.com', // required: domain for cookie sharing
    days: 7, // expires in 7 days
    path: '/',
    sameSite: 'lax'
  })

  // Complex object with TypeScript support  
  const { value: preferences, setValue: setPreferences } = useCookieState<UserPreferences>('user_prefs', {
    theme: 'light',
    language: 'en', 
    notifications: true
  }, {
    domain: '.example.com', // required domain
    days: 365
  })

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
      <button onClick={removeCount}>Reset</button>
      
      <p>Theme: {preferences.theme}</p>
      <button onClick={() => setPreferences(prev => ({ 
        ...prev, 
        theme: prev.theme === 'light' ? 'dark' : 'light' 
      }))}>
        Toggle Theme
      </button>
    </div>
  )
}
```

## API

### `useCookieState<T>(cookieName, defaultValue, cookieOptions?)`

- **cookieName**: `string` - The cookie name
- **defaultValue**: `T` - Default value if cookie doesn't exist or parsing fails  
- **cookieOptions**: `CookieOptions` - Cookie configuration options

Returns: `UseCookieStateResult<T>`

```typescript
interface UseCookieStateResult<T> {
  value: T                                    // Current cookie value
  getValue: () => T                           // Get current value (with error handling)
  setValue: (updateFunction: (prev: T) => T) => void  // Update cookie (function-only)
  deleteValue: () => void                     // Delete the cookie
  error: boolean                              // Whether an error occurred
  errorMessage: string | null                 // Error message if any
}
```

### Cookie Options

```typescript
interface CookieOptions {
  domain: string                         // Required: Cookie domain for sharing across subdomains
  days?: number                          // Expiration in days (default: 365)
  path?: string                          // Cookie path (default: '/')
  secure?: boolean                       // Secure flag (default: auto-detect based on protocol)
  sameSite?: 'strict' | 'lax' | 'none'   // SameSite attribute (default: 'lax')
}
```

### Key Features

- **🔒 Type Safe**: Full TypeScript support with generic types
- **🍪 Cross-Domain**: Smart cookie sharing that preserves existing values across subdomains  
- **⚡ Function-Only Updates**: Safe state updates that prevent accidental overwrites
- **🛡️ Error Handling**: Built-in error detection and reporting
- **🔄 SSR Compatible**: Safe for server-side rendering environments

### 🌐 Cross-Domain Behavior

The library intelligently handles cookies across subdomains:

```typescript
// On app.example.com - First to set the cookie
const { value } = useCookieState('user_prefs', { theme: 'light' }, { domain: '.example.com' })
// Creates cookie with: { theme: 'light' }

// On admin.example.com - Reuses existing cookie
const { value } = useCookieState('user_prefs', { theme: 'dark' }, { domain: '.example.com' }) 
// Gets existing value: { theme: 'light' } (NOT the default { theme: 'dark' })
```

**✅ Smart Cookie Reuse:**
- **Existing cookie**: Uses the current value (ignores default)
- **No cookie**: Sets default value for all subdomains to share
- **Parse error**: Resets to default value and saves to cookie

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build demo app 
npm run build

# Build library for npm
npm run build:lib

# Preview built demo
npm run preview
```

### 🔗 Links
- **[Live Demo](https://cookie-state.vercel.app/)** - Interactive examples
- **[GitHub Repository](https://github.com/d-arken/cookie-state)** - Source code

## License

MIT

