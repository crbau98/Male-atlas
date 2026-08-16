"use client";

import { useEffect, useState } from "react";

export function useIsPhone() {
  // Default matches the SSR guess (mobile-first) so the client's first
  // hydration pass renders identical markup to the server and avoids a
  // hydration mismatch; the real value is applied right after mount.
  const [phone, setPhone] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const sync = () => setPhone(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return phone;
}
