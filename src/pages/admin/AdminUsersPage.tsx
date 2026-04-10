import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/services/api";
import type { User } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User as UserIcon, Shield, Stethoscope } from "lucide-react";

const roleLabels: Record<string, string> = {
  profesional: "Profesional",
  paciente: "Paciente",
  admin: "Administrador",
};

const roleIcons: Record<string, typeof UserIcon> = {
  profesional: Stethoscope,
  paciente: UserIcon,
  admin: Shield,
};

const statusColors: Record<string, string> = {
  activo: "bg-success/10 text-success",
  inactivo: "bg-muted text-muted-foreground",
  bloqueado: "bg-destructive/10 text-destructive",
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listUsers({ search, role: roleFilter || undefined }).then(res => {
      setUsers(res.data);
      setLoading(false);
    });
  }, [search, roleFilter]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground">{users.length} usuarios registrados</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {["", "profesional", "paciente", "admin"].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  roleFilter === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {r ? roleLabels[r] : "Todos"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_120px_100px_100px] gap-4 px-5 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Usuario</span>
            <span>Correo</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Registro</span>
          </div>
          <div className="divide-y divide-border">
            {users.map(user => {
              const Icon = roleIcons[user.role] || UserIcon;
              return (
                <div key={user.id} className="flex flex-col md:grid md:grid-cols-[1fr_1fr_120px_100px_100px] gap-2 md:gap-4 px-5 py-4 items-center hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{user.firstName} {user.lastName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full text-center">
                    {roleLabels[user.role]}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full text-center ${statusColors[user.status]}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
