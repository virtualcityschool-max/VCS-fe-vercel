import { useState, useEffect, useRef } from "react";

export function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (!targetDate || diff <= 0)
      return { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, total: diff, isExpired: true };
    const s = Math.floor(diff / 1000);
    return {
      weeks:   Math.floor(s / (7 * 24 * 3600)),
      days:    Math.floor(s / (24 * 3600)) % 7,
      hours:   Math.floor(s / 3600) % 24,
      minutes: Math.floor(s / 60) % 60,
      seconds: s % 60,
      total:   diff,
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calc);
  const ref = useRef(targetDate);

  useEffect(() => {
    ref.current = targetDate;
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}
