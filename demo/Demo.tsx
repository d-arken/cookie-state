import { useState } from 'react'
import { useCookieState } from '../src/index'

interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'en' | 'es'
  notifications: boolean
}

interface CartItem {
  id: number
  name: string
}

function Demo() {
  // Demo 1: Simple counter with custom domain
  const {
    value: count,
    setValue: setCount,
    deleteValue: resetCount,
    error: countError,
    errorMessage: countErrorMessage,
  } = useCookieState<number>("demo_count", 0, {
    domain: "cookie-state.vercel.app",
    days: 7,
  });

  // Demo 2: User preferences object
  const {
    value: userPrefs,
    setValue: setUserPrefs,
    deleteValue: resetUserPrefs,
    error: prefsError,
    errorMessage: prefsErrorMessage,
  } = useCookieState<UserPreferences>(
    "user_preferences",
    {
      theme: "light",
      language: "en",
      notifications: true,
    },
    {
      domain: "cookie-state.vercel.app",
      days: 365,
    }
  );

  // Demo 3: Shopping cart simulation
  const {
    value: cart,
    setValue: setCart,
    deleteValue: clearCart,
    error: cartError,
    errorMessage: cartErrorMessage,
  } = useCookieState<CartItem[]>("shopping_cart", [], {
    domain: "cookie-state.vercel.app",
    days: 30,
  });

  // Local state for adding items to cart
  const [newItem, setNewItem] = useState<string>('')

  const addToCart = (): void => {
    if (newItem.trim()) {
      setCart(prev => [...prev, { id: Date.now(), name: newItem.trim() }])
      setNewItem('')
    }
  }

  const removeFromCart = (itemId: number): void => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  return (
    <div className="container">
      <h1>🍪 Cookie State Demo</h1>
      
      {/* Demo 1: Counter */}
      <div className="demo-section">
        <h3>📊 Simple Counter with Custom Domain</h3>
        <p>Domain: <code>.example.com</code> | Expires: 7 days</p>
        
        <div className="value-display">
          Count: {count}
        </div>
        
        <button onClick={() => setCount(prev => prev + 1)}>
          Increment (+1)
        </button>
        <button onClick={() => setCount(prev => prev + 5)}>
          Add 5
        </button>
        <button onClick={() => setCount(prev => Math.max(0, prev - 1))}>
          Decrement (-1)
        </button>
        <button className="danger" onClick={resetCount}>
          Reset
        </button>
        
        {countError && (
          <div className="error-message">
            Error: {countErrorMessage}
          </div>
        )}
      </div>

      {/* Demo 2: User Preferences */}
      <div className="demo-section">
        <h3>⚙️ User Preferences Object</h3>
        <p>Domain: <code>.myapp.com</code> | Expires: 365 days</p>
        
        <div className="value-display">
          {JSON.stringify(userPrefs, null, 2)}
        </div>
        
        <button onClick={() => setUserPrefs(prev => ({ 
          ...prev, 
          theme: prev.theme === 'light' ? 'dark' : 'light' 
        }))}>
          Toggle Theme
        </button>
        <button onClick={() => setUserPrefs(prev => ({ 
          ...prev, 
          language: prev.language === 'en' ? 'es' : 'en' 
        }))}>
          Toggle Language
        </button>
        <button onClick={() => setUserPrefs(prev => ({ 
          ...prev, 
          notifications: !prev.notifications 
        }))}>
          Toggle Notifications
        </button>
        <button className="danger" onClick={resetUserPrefs}>
          Reset Preferences
        </button>
        
        {prefsError && (
          <div className="error-message">
            Error: {prefsErrorMessage}
          </div>
        )}
      </div>

      {/* Demo 3: Shopping Cart */}
      <div className="demo-section">
        <h3>🛒 Shopping Cart Simulation</h3>
        <p>Domain: <code>.shop.com</code> | Expires: 30 days</p>
        
        <div className="value-display">
          Cart Items ({cart.length}):
          {cart.length === 0 ? (
            <div style={{fontStyle: 'italic', color: '#666'}}>Empty cart</div>
          ) : (
            <ul style={{margin: '0.5rem 0', paddingLeft: '1.5rem'}}>
              {cart.map(item => (
                <li key={item.id} style={{margin: '0.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span>{item.name}</span>
                  <button 
                    style={{marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}
                    className="danger"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div style={{marginBottom: '1rem'}}>
          <input 
            type="text" 
            placeholder="Enter item name"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addToCart()}
          />
          <button onClick={addToCart}>Add Item</button>
        </div>
        
        <button className="danger" onClick={clearCart}>
          Clear Cart
        </button>
        
        {cartError && (
          <div className="error-message">
            Error: {cartErrorMessage}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="demo-section">
        <h3>🧪 How to Test</h3>
        <ol style={{lineHeight: '1.6'}}>
          <li>Interact with the controls above to modify cookie values</li>
          <li>Open browser DevTools → Application → Cookies to see stored cookies</li>
          <li>Refresh the page to see values persist</li>
          <li>Try different domains by modifying the <code>defaultDomain</code> prop</li>
          <li>Note: In development, domains are ignored for localhost</li>
        </ol>
        
        <h4>🔧 Domain Configuration</h4>
        <p>The hook accepts a <code>defaultDomain</code> prop:</p>
        <div className="value-display">
{`// Example usage
const { value, setValue } = useCookieState('key', defaultValue, {
  defaultDomain: '.yourdomain.com',
  days: 30,
  path: '/',
  secure: true,
  sameSite: 'Lax'
})`}
        </div>
      </div>
    </div>
  )
}

export default Demo
