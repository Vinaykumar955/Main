import { useCallback, useEffect, useRef } from "react";

/**
 * Stable callback ref — returns a ref that always holds the latest callback.
 * Useful when passing handlers to memoised children.
 */
export function useLatestCallback<TArgs extends unknown[], TRet>(
  fn: (...args: TArgs) => TRet,
) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args: TArgs) => ref.current(...args), []);
}
