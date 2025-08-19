# Cookie State

A minimal React library for state management using cookies.

## Installation

```bash
npm install cookie-state
```

## Usage

```tsx
import { useCookieState } from 'cookie-state'

function MyComponent() {
  const { value: count, setValue: setCount, deleteValue: removeCount } = useCookieState('count', 0, {
    defaultDomain: '.example.com', // custom domain for production
    days: 7, // expires in 7 days
    path: '/',
    sameSite: 'lax'
  })

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
      <button onClick={removeCount}>Reset</button>
    </div>
  )
}
```

## API

### `useCookieState(cookieName, defaultValue, cookieOptions?)`

- **cookieName**: `string` - The cookie name
- **defaultValue**: `any` - Default value if cookie doesn't exist or parsing fails
- **cookieOptions**: `object` - Cookie configuration options

Returns an object: `{ value, getValue, setValue, deleteValue, error, errorMessage }`

### Cookie Options

- **days**: `number` - Expiration in days (default: 365)
- **defaultDomain**: `string` - Default domain for production (default: undefined)
- **domain**: `string` - Cookie domain (default: no domain in dev, defaultDomain in production)
- **path**: `string` - Cookie path (default: '/')
- **secure**: `boolean` - Secure flag (default: auto-detect based on protocol)
- **sameSite**: `'strict' | 'lax' | 'none'` - SameSite attribute (default: 'Lax')

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

