import { useEffect, useState } from "react";

/**
 * Tracks a clock that updates every `interval` ms. Used for the telemetry strip.
 */
export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
