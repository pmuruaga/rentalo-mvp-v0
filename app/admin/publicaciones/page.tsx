import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/currentUserProfile";
import { isAdminRole } from "@/lib/admin";
import { AdminPublicacionesPanel } from "@/components/admin/AdminPublicacionesPanel";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin · Publicaciones",
};

export default async function AdminPublicacionesPage() {
  const user = await getCurrentUserProfile();
  if (!user) {
    redirect("/login?callbackUrl=%2Fadmin%2Fpublicaciones");
  }
  if (!isAdminRole(user.role)) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/">← Volver al sitio</Link>
        </Button>
      </div>
      <AdminPublicacionesPanel />
    </div>
  );
}
