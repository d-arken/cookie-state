import useCookieStateImpl from "./useCookieState";

// Named export for modern imports
export const useCookieState = useCookieStateImpl;

// Default export for compatibility with older environments
export default useCookieState;

// Type exports
export type { CookieOptions, UseCookieStateResult } from "./useCookieState";
