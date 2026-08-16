"use client";

import { useEffect, useState } from "react";

function readPhone() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
}

export function useIsPhone() {
  const [phone, setPhone] = useState(readPhone);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const sync = () => setPhone(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return phone;
}
