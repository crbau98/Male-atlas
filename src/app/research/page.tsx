import type { Metadata, Viewport } from "next";
import ResearchLab from "./research-lab";

export const metadata: Metadata = {
  title: "ATLAS | Clinical research workspace",
  description: "Illustrative physiology and a sourced sexual-health research library.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, userScalable: true };
export default function ResearchPage() { return <ResearchLab />; }
