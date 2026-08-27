import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleDot,
  Clock,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Search,
  Timer,
  UserRound
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage, timeAgo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog";
import { DeleteTicketDialog } from "@/components/tickets/delete-ticket-dialog";
import {
  PriorityBadge,
  StatusBadge,
  priorityLabel
} from "@/components/tickets/ticket-badges";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  UserOption
} from "@/components/tickets/types";

async function fetchTickets(): Promise<Ticket[]> {
  const res = await api.get("/tickets/list");
  return res.data.ticket;
}

async function fetchUsers(): Promise<UserOption[]> {
  const res = await api.get("/auth/users");
  return res.data.users;
}

async function updateTicket(
  id: string,
  data: Partial<Pick<Ticket, "status" | "priority" | "description">>
) {
  const res = await api.put(`/tickets/${id}`, data);
  return res.data;
}

async function assignTicketToAgent(id: string, agentId: string) {
  const res = await api.patch(`/tickets/${id}/assign`, { agentId });
  return res.data;
}

async function deleteTicket(id: string) {
  await api.delete(`/tickets/${id}`);
}

const statTones: Record<string, string> = {
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: keyof typeof statTones;
}

function StatCard({ icon, label, value, tone }: StatCardProps) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span
            className={`flex size-7 items-center justify-center rounded-lg ${statTones[tone]}`}
          >
            {icon}
          </span>
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export function TicketsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.role ?? null;
  const userId = user?._id ?? null;

  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: role === "admin"
  });

  const agents = users.filter((u) => u.role === "agent");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>(
    "all"
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");

  const stats = useMemo(() => {
    const tickets = data ?? [];
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      closed: tickets.filter((t) => t.status === "closed").length
    };
  }, [data]);

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  const filteredTickets = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      if (
        q &&
        !t.title.toLowerCase().includes(q) &&
        !t.description.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [data, search, statusFilter, priorityFilter]);

  const invalidateTickets = () =>
    queryClient.invalidateQueries({ queryKey: ["tickets"] });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Parameters<typeof updateTicket>[1];
    }) => updateTicket(id, data),
    onSuccess: () => {
      invalidateTickets();
      setEditingId(null);
      setEditingDescription("");
      toast.success("Ticket actualizado");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Error al actualizar el ticket"))
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
      assignTicketToAgent(id, agentId),
    onSuccess: () => {
      invalidateTickets();
      toast.success("Ticket asignado");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Error al asignar el ticket"))
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      invalidateTickets();
      toast.success("Ticket eliminado");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Error al eliminar el ticket"))
  });

  const handleSaveDescription = (e: FormEvent) => {
    e.preventDefault();
    if (!editingId || !editingDescription.trim()) return;
    updateMutation.mutate({
      id: editingId,
      data: { description: editingDescription }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las solicitudes de soporte.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Nuevo ticket
        </Button>
      </div>

      {role === "admin" && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Inbox className="size-4" />}
            label="Total"
            value={stats.total}
            tone="slate"
          />
          <StatCard
            icon={<CircleDot className="size-4" />}
            label="Pendientes"
            value={stats.open}
            tone="amber"
          />
          <StatCard
            icon={<Timer className="size-4" />}
            label="En progreso"
            value={stats.inProgress}
            tone="blue"
          />
          <StatCard
            icon={<CheckCircle2 className="size-4" />}
            label="Resueltos"
            value={stats.closed}
            tone="emerald"
          />
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | TicketStatus)}
        >
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="open">Pendientes</TabsTrigger>
            <TabsTrigger value="in_progress">En progreso</TabsTrigger>
            <TabsTrigger value="closed">Resueltos</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tickets..."
              className="pl-8"
              aria-label="Buscar tickets"
            />
          </div>
          <Select
            value={priorityFilter}
            onValueChange={(v) =>
              setPriorityFilter(v as "all" | TicketPriority)
            }
          >
            <SelectTrigger
              className="w-full sm:w-[170px]"
              aria-label="Filtrar por prioridad"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">Todas las prioridades</SelectItem>
              {(["high", "medium", "low"] as const).map((p) => (
                <SelectItem key={p} value={p}>
                  {priorityLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="gap-0 py-0">
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getApiErrorMessage(error, "Error al cargar los tickets")}
        </div>
      )}

      {!isLoading && !isError && filteredTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-medium">
            {hasFilters ? "Sin resultados" : "Aún no hay tickets"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {hasFilters
              ? "Prueba con otra búsqueda o cambia los filtros."
              : "Crea tu primer ticket con el botón «Nuevo ticket»."}
          </p>
        </div>
      )}

      {!isLoading && filteredTickets.length > 0 && (
        <ul className="space-y-3">
          {filteredTickets.map((ticket) => {
            const isAdmin = role === "admin";
            const isOwner = !!userId && ticket.createdBy === userId;
            const canEditDescription = isAdmin || (role === "user" && isOwner);
            const canDelete = isAdmin || (role === "user" && isOwner);
            const isEditing = editingId === ticket._id;
            const assignedId = ticket.assignedTo
              ? String(ticket.assignedTo)
              : null;
            const assignedUser =
              assignedId != null
                ? users.find((u) => u._id === assignedId)
                : null;

            return (
              <li key={ticket._id}>
                <Card className="gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                      <div className="min-w-0 space-y-1.5">
                        <h2 className="font-medium leading-snug break-words">
                          {ticket.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {ticket.status && (
                            <StatusBadge status={ticket.status} />
                          )}
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                      </div>

                      {(canEditDescription || canDelete) && (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {canEditDescription && !isEditing && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingId(ticket._id);
                                setEditingDescription(ticket.description);
                              }}
                            >
                              <Pencil />
                              Editar descripción
                            </Button>
                          )}
                          {canDelete && (
                            <DeleteTicketDialog
                              pending={
                                deleteMutation.isPending &&
                                deleteMutation.variables === ticket._id
                              }
                              onConfirm={() => deleteMutation.mutate(ticket._id)}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleSaveDescription} className="mt-3 space-y-2">
                        <Textarea
                          rows={3}
                          required
                          value={editingDescription}
                          onChange={(e) =>
                            setEditingDescription(e.target.value)
                          }
                          aria-label="Editar descripción"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending && (
                              <Loader2 className="animate-spin" />
                            )}
                            Guardar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setEditingDescription("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      ticket.description && (
                        <p className="mt-2 text-sm whitespace-pre-wrap break-words text-muted-foreground">
                          {ticket.description}
                        </p>
                      )
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      {ticket.assignedTo && (
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <UserRound className="size-3.5 shrink-0" />
                          Asignado a{" "}
                          {assignedUser ? (
                            <span className="truncate font-medium text-foreground">
                              {assignedUser.name}{" "}
                              <span className="font-normal">
                                ({assignedUser.email})
                              </span>
                            </span>
                          ) : (
                            <code className="rounded bg-muted px-1 py-0.5">
                              {String(ticket.assignedTo).slice(0, 8)}...
                            </code>
                          )}
                        </span>
                      )}
                      {ticket.createdAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5 shrink-0" />
                          {timeAgo(ticket.createdAt)}
                        </span>
                      )}
                    </div>

                    {(isAdmin || canDelete) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                        {isAdmin && (
                          <>
                            {ticket.status && (
                              <div className="flex items-center gap-1.5">
                                <Label className="sr-only">Estado</Label>
                                <Select
                                  value={ticket.status}
                                  onValueChange={(v) =>
                                    updateMutation.mutate({
                                      id: ticket._id,
                                      data: { status: v as TicketStatus }
                                    })
                                  }
                                  disabled={updateMutation.isPending}
                                >
                                  <SelectTrigger size="sm" className="w-[130px]" aria-label="Cambiar estado">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent position="popper">
                                    {(
                                      [
                                        "open",
                                        "in_progress",
                                        "closed"
                                      ] as const
                                    ).map((s) => (
                                      <SelectItem key={s} value={s}>
                                        {
                                          {
                                            open: "Pendiente",
                                            in_progress: "En progreso",
                                            closed: "Resuelto"
                                          }[s]
                                        }
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {agents.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Label className="sr-only">Asignar agente</Label>
                                <Select
                                  value={assignedId ?? undefined}
                                  onValueChange={(agentId) =>
                                    assignMutation.mutate({
                                      id: ticket._id,
                                      agentId
                                    })
                                  }
                                  disabled={assignMutation.isPending}
                                >
                                  <SelectTrigger size="sm" className="w-[180px]" aria-label="Asignar agente">
                                    <SelectValue placeholder="+ Asignar agente" />
                                  </SelectTrigger>
                                  <SelectContent position="popper">
                                    {agents.map((a) => (
                                      <SelectItem key={a._id} value={a._id}>
                                        {a.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </>
                        )}
                        <span className="flex-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <CreateTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isAdmin={role === "admin"}
        agents={agents}
      />
    </div>
  );
}
