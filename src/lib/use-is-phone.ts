"use client";

import { useEffect, useState } from "react";

export function useIsPhone() {
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const sync = () => setPhone(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return phone;
}
