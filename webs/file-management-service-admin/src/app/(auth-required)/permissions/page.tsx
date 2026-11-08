import { redirect } from "next/navigation";

export default function PermissionsIndexPage() {
  redirect("/permissions/groups");
}
