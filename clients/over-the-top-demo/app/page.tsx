import { redirect } from "next/navigation";

/** The root is the lab during the prototype cycle. No concept gets to be "the" homepage. */
export default function Root() {
  redirect("/lab");
}
