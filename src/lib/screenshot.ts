"use client";

import { canvasRef } from "./canvas-ref";

type ShareNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
};

export async function captureView(): Promise<"shared" | "downloaded" | "failed"> {
  const canvas = canvasRef.current;
  if (!canvas) return "failed";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });
  if (!blob) return "failed";

  const filename = `male-atlas-${Date.now()}.png`;
  const nav = navigator as ShareNavigator;

  if (nav.share) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (!nav.canShare || nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "Male Atlas view" });
        return "shared";
      }
    } catch {
      // Fall through to a direct download when sharing is cancelled or unsupported.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}
