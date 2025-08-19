import { useState, useCallback } from "react";

/**
 * Get a cookie value by name
 * @param {string} name Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
const getCookie = (name) => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
};

/**
 * Set a cookie with the specified name, value, and options
 * @param {string} name Cookie name
 * @param {string} value Cookie value
 * @param {Object} options Cookie options
 * @param {number} options.days Expiration in days (default: 365)
 * @param {string} options.domain Cookie domain (default: no domain in dev, custom domain in production)
 * @param {string} options.defaultDomain Default domain for production (default: undefined)
 * @param {string} options.path Cookie path (default: '/')
 * @param {boolean} options.secure Use secure flag (default: true for production)
 * @param {string} options.sameSite SameSite attribute (default: 'Lax')
 */
const setCookie = (name, value, options = {}) => {
  if (typeof document === "undefined") return;

  const isDevelopment = process.env.NODE_ENV === "development";

  const {
    days = 365,
    domain = isDevelopment ? undefined : options.defaultDomain, // Don't set domain for localhost
    defaultDomain,
    path = "/",
    secure = window.location.protocol === "https:",
    sameSite = "Lax",
  } = options;

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
 * @param {string} name Cookie name
 * @param {Object} options Cookie options
 * @param {string} options.domain Cookie domain (default: no domain in dev, custom domain in production)
 * @param {string} options.defaultDomain Default domain for production (default: undefined)
 * @param {string} options.path Cookie path (default: '/')
 */
const deleteCookie = (name, options = {}) => {
  if (typeof document === "undefined") return;

  const isDevelopment = process.env.NODE_ENV === "development";

  const {
    domain = isDevelopment ? undefined : options.defaultDomain, // Don't set domain for localhost
    defaultDomain,
    path = "/",
  } = options;

  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

  // Only add domain if specified (don't add for localhost)
  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  document.cookie = cookieString;
};

/**
 * @typedef UseCookieStateResult
 * @property {*} value Current value of the cookie (parsed from JSON)
 * @property {function} setValue Function to update the cookie value (accepts only update functions)
 * @property {function} deleteValue Function to delete the cookie
 * @property {boolean} error Whether an error occurred during JSON parsing/stringifying
 * @property {string|null} errorMessage Error message if an error occurred
 */

/**
 * React hook for storing and retrieving JSON objects in cookies with subdomain access
 * Uses function-only updates for safe state management and property preservation
 *
 * @param {string} cookieName Name of the cookie
 * @param {*} defaultValue Default value to return if cookie doesn't exist or parsing fails
 * @param {Object} cookieOptions Cookie options
 * @param {number} cookieOptions.days Expiration in days (default: 365)
 * @param {string} cookieOptions.domain Cookie domain (default: no domain in dev, defaultDomain in production)
 * @param {string} cookieOptions.defaultDomain Default domain for production (default: undefined)
 * @param {string} cookieOptions.path Cookie path (default: '/')
 * @param {boolean} cookieOptions.secure Use secure flag (default: auto-detect based on protocol)
 * @param {string} cookieOptions.sameSite SameSite attribute (default: 'Lax')
 *
 * @returns {UseCookieStateResult}
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
const useCookieState = (
  cookieName,
  defaultValue = null,
  cookieOptions = {}
) => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Function to get the current value from cookie (without error handling for initialization)
  const getInitialValue = useCallback(() => {
    try {
      const cookieValue = getCookie(cookieName);
      if (cookieValue === null) {
        return defaultValue;
      }

      // Try to parse as JSON
      const parsed = JSON.parse(decodeURIComponent(cookieValue));
      return parsed;
    } catch (err) {
      console.warn(`Error parsing cookie "${cookieName}":`, err.message);
      return defaultValue;
    }
  }, [cookieName, defaultValue]);

  // Initialize state with current cookie value
  const [value, setValue] = useState(getInitialValue);

  // Function to get the current value from cookie (with error handling)
  const getValue = useCallback(() => {
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
      console.warn(`Error parsing cookie "${cookieName}":`, err.message);
      setError(true);
      setErrorMessage(err.message);
      return defaultValue;
    }
  }, [cookieName, defaultValue, setError, setErrorMessage]);

  // Function to set cookie value (function updates only)
  const setCookieValue = useCallback(
    (updateFunction) => {
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
        console.error(`Error setting cookie "${cookieName}":`, err.message);
        setError(true);
        setErrorMessage(err.message);
      }
    },
    [cookieName, cookieOptions, defaultValue, value, setError, setErrorMessage]
  );

  // Function to delete cookie
  const deleteCookieValue = useCallback(() => {
    try {
      setError(false);
      setErrorMessage(null);

      deleteCookie(cookieName, cookieOptions);
      setValue(defaultValue);
    } catch (err) {
      console.error(`Error deleting cookie "${cookieName}":`, err.message);
      setError(true);
      setErrorMessage(err.message);
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
