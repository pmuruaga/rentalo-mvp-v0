import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/currentUserProfile";
import { isAdminRole } from "@/lib/admin";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin · Usuarios",
};

export default async function AdminUsuariosPage() {
  const user = await getCurrentUserProfile();
  if (!user) {
    redirect("/login?callbackUrl=%2Fadmin%2Fusuarios");
  }
  if (!isAdminRole(user.role)) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/">← Volver al sitio</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/admin/publicaciones">Publicaciones</Link>
        </Button>
      </div>
      <AdminUsersPanel />
    </div>
  );
}
