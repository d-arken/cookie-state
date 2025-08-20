import { useState, useCallback } from "react";

export interface CookieOptions {
  days?: number;
  domain: string;
  path?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface UseCookieStateResult<T = any> {
  value: T;
  getValue: () => T;
  setValue: (updateFunction: (prev: T) => T) => void;
  deleteValue: () => void;
  error: boolean;
  errorMessage: string | null;
}

/**
 * Get a cookie value by name
 */
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop();
    if (cookieValue) {
      return cookieValue.split(";").shift() || null;
    }
  }
  return null;
};

/**
 * Set a cookie with the specified name, value, and options
 */
const setCookie = (name: string, value: string, options: CookieOptions): void => {
  if (typeof document === "undefined") return;

  const {
    days = 365,
    domain = undefined, // Don't set domain for localhost
    path = "/",
    secure = window.location.protocol === "https:",
    sameSite = "Lax",
  } = options || {};

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=${path}; SameSite=${sameSite}`;

  // Only add domain if specified (don't add for localhost)
  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += "; Secure";
  }

  console.log("cookieString", cookieString);

  document.cookie = cookieString;
};

/**
 * Delete a cookie by setting it to expire in the past
 */
const deleteCookie = (name: string, options: CookieOptions): void => {
  if (typeof document === "undefined") return;

  const {
    domain = undefined, // Don't set domain for localhost
    path = "/",
  } = options || {};

  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

  // Only add domain if specified (don't add for localhost)
  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  document.cookie = cookieString;
};

/**
 * React hook for storing and retrieving JSON objects in cookies with subdomain access
 * Uses function-only updates for safe state management and property preservation
 *
 * @example
 * // Basic usage with custom domain
 * const { value: uiData, setValue: setUiData, deleteValue: deleteUiData, error, errorMessage } = useCookieState(
 *   'ui_data', 
 *   { isSidebarOpen: true },
 *   { defaultDomain: '.oppizi.com' }
 * )
 *
 * // Update specific properties (function-only updates)
 * setUiData(prev => ({ ...prev, isSidebarOpen: false }))
 *
 * // Toggle a boolean value
 * setUiData(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))
 *
 * // Add new properties while preserving existing ones
 * setUiData(prev => ({ ...prev, theme: 'dark', language: 'es' }))
 *
 * // Delete cookie data
 * deleteUiData()
 *
 * // Check for errors
 * if (error) {
 *   console.error('Cookie error:', errorMessage)
 * }
 */
const useCookieState = <T = any>(
  cookieName: string,
  defaultValue: T,
  cookieOptions: CookieOptions): UseCookieStateResult<T> => {
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to get the current value from cookie (without error handling for initialization)
  const getInitialValue = useCallback((): T => {
    try {
      const cookieValue = getCookie(cookieName);
      if (cookieValue === null) {
        return defaultValue;
      }

      // Try to parse as JSON
      const parsed = JSON.parse(decodeURIComponent(cookieValue));
      return parsed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`Error parsing cookie "${cookieName}":`, errorMessage);
      return defaultValue;
    }
  }, [cookieName, defaultValue]);

  // Initialize state with current cookie value
  const [value, setValue] = useState<T>(getInitialValue);

  // Function to get the current value from cookie (with error handling)
  const getValue = useCallback((): T => {
    try {
      setError(false);
      setErrorMessage(null);

      const cookieValue = getCookie(cookieName);
      if (cookieValue === null) {
        return defaultValue;
      }

      // Try to parse as JSON
      const parsed = JSON.parse(decodeURIComponent(cookieValue));
      return parsed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`Error parsing cookie "${cookieName}":`, errorMessage);
      setError(true);
      setErrorMessage(errorMessage);
      return defaultValue;
    }
  }, [cookieName, defaultValue, setError, setErrorMessage]);

  // Function to set cookie value (function updates only)
  const setCookieValue = useCallback(
    (updateFunction: (prev: T) => T): void => {
      try {
        setError(false);
        setErrorMessage(null);

        // Enforce function-only updates for safety
        if (typeof updateFunction !== "function") {
          console.error(
            `useCookieState("${cookieName}") only accepts function updates. Use: setValue(prev => ({ ...prev, newProperty: value }))`
          );
          return;
        }

        const resolvedValue = updateFunction(value || defaultValue);

        // Handle undefined values gracefully
        if (resolvedValue === undefined) {
          console.warn(
            `Update function returned undefined for cookie "${cookieName}". Using default value instead.`
          );
          const finalValue = defaultValue;
          const stringValue = encodeURIComponent(JSON.stringify(finalValue));
          setCookie(cookieName, stringValue, cookieOptions);
          setValue(finalValue);
          return;
        }

        const stringValue = encodeURIComponent(JSON.stringify(resolvedValue));
        setCookie(cookieName, stringValue, cookieOptions);
        setValue(resolvedValue);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error setting cookie "${cookieName}":`, errorMessage);
        setError(true);
        setErrorMessage(errorMessage);
      }
    },
    [cookieName, cookieOptions, defaultValue, value, setError, setErrorMessage]
  );

  // Function to delete cookie
  const deleteCookieValue = useCallback((): void => {
    try {
      setError(false);
      setErrorMessage(null);

      deleteCookie(cookieName, cookieOptions);
      setValue(defaultValue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Error deleting cookie "${cookieName}":`, errorMessage);
      setError(true);
      setErrorMessage(errorMessage);
    }
  }, [cookieName, cookieOptions, defaultValue, setError, setErrorMessage]);

  return {
    value,
    getValue,
    setValue: setCookieValue,
    deleteValue: deleteCookieValue,
    error,
    errorMessage,
  };
};

export default useCookieState;
