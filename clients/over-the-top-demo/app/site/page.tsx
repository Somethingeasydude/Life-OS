import type { Metadata } from "next";
import HeritagePage from "@/components/d/HeritagePage";

export const metadata: Metadata = { title: "Over the Top Burger Bar" };

/**
 * THE CLIENT BUILD — what the owner opens.
 *
 * No concept switcher, no lab page, no "prototype D of four". He should see one
 * finished restaurant site, because a demo that shows its own workings reads as
 * indecision. The footer still says plainly that this is a concept and who made
 * it: he needs to know it is not his live site, and Robert needs the credit when
 * this gets forwarded.
 */
export default function ClientSite() {
  return <HeritagePage />;
}
