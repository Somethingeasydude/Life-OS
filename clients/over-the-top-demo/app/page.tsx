import type { Metadata } from "next";
import HeritagePage from "@/components/d/HeritagePage";

export const metadata: Metadata = { title: "Over the Top Burger Bar" };

/**
 * THE CLIENT BUILD, at the root — what the owner opens.
 *
 * No concept switcher, no lab page, no "prototype D of four". He should see one
 * finished restaurant site, because a demo that shows its own workings reads as
 * indecision. The lab still lives at /lab for our own comparison; it just is not
 * what a link to this deployment lands on.
 *
 * The footer says plainly that this is a concept and who made it: he needs to
 * know it is not his live site, and Robert needs the credit when it is
 * forwarded.
 */
export default function ClientSite() {
  return <HeritagePage />;
}
