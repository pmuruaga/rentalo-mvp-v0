"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/UserAvatar";
import { UserNameWithBadges } from "@/components/user/VerificationBadge";
import {
  USER_VERIFICATION_LABELS,
  USER_VERIFICATION_STATUS_VALUES,
  type UserVerificationStatusValue,
} from "@/lib/userBadges";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isBusiness: boolean;
  businessName: string | null;
  verificationStatus: UserVerificationStatusValue;
  createdAt: string;
};

function displayName(row: AdminUserRow): string {
  if (row.isBusiness && row.businessName?.trim()) return row.businessName.trim();
  return row.name || row.email;
}

export function AdminUsersPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setError(null);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (res.status === 401) {
      router.replace("/login?callbackUrl=%2Fadmin%2Fusuarios");
      return;
    }
    if (res.status === 403) {
      router.replace("/");
      return;
    }
    if (!res.ok) {
      setError("No se pudieron cargar los usuarios.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as AdminUserRow[];
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const updateVerification = async (
    id: string,
    verificationStatus: UserVerificationStatusValue
  ) => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus }),
      });
      if (res.status === 401) {
        router.replace("/login?callbackUrl=%2Fadmin%2Fusuarios");
        return;
      }
      if (res.status === 403) {
        router.replace("/");
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "No se pudo actualizar la verificación.");
        return;
      }
      const updated = (await res.json()) as AdminUserRow;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, verificationStatus: updated.verificationStatus }
            : u
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando usuarios…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestioná el estado de verificación de las cuentas.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {users.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-muted/50 p-8 text-center text-muted-foreground">
          No hay usuarios registrados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Verificación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const name = displayName(u);
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          imageUrl={u.image}
                          displayName={name}
                          isBusiness={u.isBusiness}
                          size="sm"
                        />
                        <UserNameWithBadges
                          name={name}
                          verificationStatus={u.verificationStatus}
                          badgeSize={14}
                          nameClassName="font-medium"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.isBusiness ? "Empresa" : "Particular"}
                      {u.role === "ADMIN" ? " · Admin" : ""}
                    </TableCell>
                    <TableCell>
                      <select
                        className="h-9 min-w-[11rem] rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        value={u.verificationStatus}
                        disabled={updatingId === u.id}
                        onChange={(e) =>
                          void updateVerification(
                            u.id,
                            e.target.value as UserVerificationStatusValue
                          )
                        }
                      >
                        {USER_VERIFICATION_STATUS_VALUES.map((status) => (
                          <option key={status} value={status}>
                            {USER_VERIFICATION_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
