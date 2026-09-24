import type { Metadata } from "next";
import HeritagePage from "@/components/d/HeritagePage";

export const metadata: Metadata = { title: "Concept D — Filipino Heritage" };

/** The review copy: same page, plus the lab chrome for comparing directions. */
export default function ConceptD() {
  return <HeritagePage lab />;
}
