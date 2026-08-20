export const canvasRef: { current: HTMLCanvasElement | null } = { current: null };
export const captureFrameRef: {
  current: (() => Promise<Blob | null>) | null;
} = { current: null };
