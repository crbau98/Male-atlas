import type { Metadata } from "next";
import AnatomyStudy from "./anatomy-study";
export const metadata: Metadata = {
  title: "ATLAS | Adult anatomy study",
  description:
    "An interactive clinical reference for adult surface anatomy, reproductive structures and illustrative physiology.",
};
export default function AnatomyPage() {
  return <AnatomyStudy />;
}
