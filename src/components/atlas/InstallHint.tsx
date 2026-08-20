"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

function isStandalone() {
  const media = window.matchMedia("(display-mode: standalone)");
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return media.matches || Boolean(nav.standalone);
}

export function InstallHint() {
  // Default true (hidden) matches SSR so the first client hydration pass
  // renders identical markup to the server; the real value lands post-mount.
  const [standalone, setStandalone] = useState(true);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setStandalone(isStandalone()), 0);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  if (standalone || hidden) return null;

  return (
    <div className="pointer-events-auto flex items-center justify-between gap-2 rounded-full border border-white/10 bg-[#101218]/90 px-3 py-2 text-[11px] text-[#d9c59a] backdrop-blur-md">
      {installEvent ? (
        <button
          type="button"
          className="min-h-9 flex-1 text-left"
          onClick={() => {
            void installEvent.prompt();
            setHidden(true);
          }}
        >
          Install Male Atlas on this phone
        </button>
      ) : (
        <p className="flex-1 leading-4">Share → Add to Home Screen for the full app</p>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setHidden(true)}
        className="min-h-9 px-2 text-[#9a958c]"
      >
        ×
      </button>
    </div>
  );
}
