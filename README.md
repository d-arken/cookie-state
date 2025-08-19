# Cookie State

A minimal React library for state management using cookies with full TypeScript support.

## Installation

```bash
npm install cookie-state
```

## Usage

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
    defaultDomain: '.example.com', // custom domain for production
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
    defaultDomain: '.example.com',
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
  days?: number                          // Expiration in days (default: 365)
  defaultDomain?: string                 // Default domain for production (default: undefined)  
  domain?: string                        // Cookie domain (default: auto-determined)
  path?: string                          // Cookie path (default: '/')
  secure?: boolean                       // Secure flag (default: auto-detect based on protocol)
  sameSite?: 'strict' | 'lax' | 'none'   // SameSite attribute (default: 'lax')
}
```

### Key Features

- **🔒 Type Safe**: Full TypeScript support with generic types
- **🍪 Cross-Domain**: Configurable domain support for subdomain sharing  
- **⚡ Function-Only Updates**: Safe state updates that prevent accidental overwrites
- **🛡️ Error Handling**: Built-in error detection and reporting
- **🔄 SSR Compatible**: Safe for server-side rendering environments

## Development

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build library
npm run build
```

## License

MIT

