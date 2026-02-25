import { FormEvent, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high";
  createdBy: string;
  assignedTo?: string | null;
  createdAt?: string;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  role: string;
}

function formatStatusLabel(status: Ticket["status"]) {
  switch (status) {
    case "open":
      return "Pendiente";
    case "in_progress":
      return "En progreso";
    case "closed":
      return "Resuelto";
    default:
      return status;
  }
}

function formatPriorityLabel(priority: Ticket["priority"]) {
  switch (priority) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    case "low":
    default:
      return "Baja";
  }
}

async function fetchTickets(): Promise<Ticket[]> {
  const res = await api.get("/tickets/list");
  return res.data.ticket;
}

async function fetchUsers(): Promise<UserOption[]> {
  const res = await api.get("/auth/users");
  return res.data.users;
}

interface CreateTicketPayload {
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  assignedTo?: string | null;
}

async function createTicket(data: CreateTicketPayload) {
  const res = await api.post("/tickets/create", data);
  return res.data.ticket;
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

export function TicketsPage() {
  const queryClient = useQueryClient();
  const { role, userId } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: role === "admin"
  });

  const agents = users.filter((u) => u.role === "agent");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [assignedTo, setAssignedTo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");

  const invalidateTickets = () =>
    queryClient.invalidateQueries({ queryKey: ["tickets"] });

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      invalidateTickets();
      setTitle("");
      setDescription("");
      setPriority("low");
      setAssignedTo("");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTicket>[1] }) =>
      updateTicket(id, data),
    onSuccess: () => {
      invalidateTickets();
      setEditingId(null);
      setEditingDescription("");
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
      assignTicketToAgent(id, agentId),
    onSuccess: invalidateTickets
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTicket,
    onSuccess: invalidateTickets
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const payload: CreateTicketPayload = {
      title,
      description
    };

    if (role === "admin") {
      payload.priority = priority;
      if (assignedTo.trim()) {
        payload.assignedTo = assignedTo.trim();
      }
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="tickets-layout">
      <section className="card">
        <h1>Tickets</h1>
        {isLoading && <p>Cargando tickets...</p>}
        {isError && (
          <div className="alert error">
            {(error as any)?.response?.data?.message ||
              (error as any)?.message ||
              "Error al cargar tickets"}
          </div>
        )}
        {!isLoading && data && data.length === 0 && (
          <p className="muted">No hay tickets aún. Crea el primero.</p>
        )}
        <ul className="tickets-list">
          {data?.map((ticket) => {
            const isAdmin = role === "admin";
            const isOwner = !!userId && ticket.createdBy === userId;
            const canEditDescription = isAdmin || (role === "user" && isOwner);
            const canDelete = isAdmin || (role === "user" && isOwner);
            const isEditing = editingId === ticket._id;
            const assignedId = ticket.assignedTo
              ? String(ticket.assignedTo)
              : null;
            const assignedUser =
              isAdmin && assignedId
                ? users.find((u) => u._id === assignedId)
                : null;

            return (
              <li key={ticket._id} className="ticket-item">
                <div className="ticket-header">
                  <h2>{ticket.title}</h2>
                  <div className="ticket-badges">
                    {ticket.status && (
                      <span
                        className={`status-badge status-${ticket.status.toLowerCase()}`}
                      >
                        {formatStatusLabel(ticket.status)}
                      </span>
                    )}
                    <span
                      className={`priority-badge priority-${ticket.priority}`}
                    >
                      {formatPriorityLabel(ticket.priority)}
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="ticket-edit">
                    <textarea
                      rows={3}
                      className="ticket-edit-textarea"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                    />
                    <div className="ticket-edit-actions">
                      <button
                        type="button"
                        className="btn-primary btn-xs"
                        disabled={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            id: ticket._id,
                            data: { description: editingDescription }
                          })
                        }
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-xs"
                        onClick={() => {
                          setEditingId(null);
                          setEditingDescription("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {ticket.description && (
                      <p className="ticket-description">
                        {ticket.description}
                      </p>
                    )}
                    {canEditDescription && (
                      <button
                        type="button"
                        className="btn-secondary btn-xs"
                        onClick={() => {
                          setEditingId(ticket._id);
                          setEditingDescription(ticket.description);
                        }}
                      >
                        Editar descripción
                      </button>
                    )}
                  </>
                )}

                <div className="ticket-meta-row">
                  {ticket.assignedTo && (
                    <span className="ticket-meta">
                      Asignado:{" "}
                      {assignedUser ? (
                        <span className="assigned-name">
                          {assignedUser.name} ({assignedUser.email})
                        </span>
                      ) : (
                        <code className="id-chip">
                          {String(ticket.assignedTo).slice(0, 8)}...
                        </code>
                      )}
                    </span>
                  )}
                  {ticket.createdAt && (
                    <span className="ticket-meta">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="ticket-actions">
                  {role === "admin" && (
                    <>
                      <label className="ticket-action-group">
                        <span className="ticket-action-label">Estado</span>
                        <select
                          className="select-sm"
                          value={ticket.status}
                          onChange={(e) =>
                            updateMutation.mutate({
                              id: ticket._id,
                              data: {
                                status: e.target.value as
                                  | "open"
                                  | "in_progress"
                                  | "closed"
                              }
                            })
                          }
                          disabled={updateMutation.isPending}
                        >
                          <option value="open">Pendiente</option>
                          <option value="in_progress">En progreso</option>
                          <option value="closed">Resuelto</option>
                        </select>
                      </label>

                      {agents.length > 0 && (
                        <label className="ticket-action-group">
                          <span className="ticket-action-label">
                            Asignar agente
                          </span>
                          <select
                            className="select-sm"
                            defaultValue=""
                            onChange={(e) => {
                              const agentId = e.target.value;
                              if (!agentId) return;
                              assignMutation.mutate({
                                id: ticket._id,
                                agentId
                              });
                              e.target.value = "";
                            }}
                            disabled={assignMutation.isPending}
                          >
                            <option value="">— Elegir —</option>
                            {agents.map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.name} ({a.email})
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      className="btn-danger-sm"
                      onClick={() => {
                        if (window.confirm("¿Eliminar este ticket?")) {
                          deleteMutation.mutate(ticket._id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="card card-create-ticket">
        <h2>Crear nuevo ticket</h2>
        <form onSubmit={handleSubmit} className="form">
          <label className="form-field">
            <span>Título</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Descripción</span>
            <textarea
              rows={3}
              required
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          {role === "admin" && (
            <label className="form-field">
              <span>Prioridad</span>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </label>
          )}
          {role === "admin" && (
            <label className="form-field">
              <span>ID de agente (assignedTo)</span>
              <input
                type="text"
                placeholder="ObjectId de Mongo (opcional)"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </label>
          )}
          {createMutation.isError && (
            <div className="alert error">
              {(createMutation.error as any)?.response?.data?.message ||
                (createMutation.error as any)?.message ||
                "Error al crear ticket"}
            </div>
          )}
          <button
            className="btn-primary"
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creando..." : "Crear ticket"}
          </button>
        </form>
      </section>
    </div>
  );
}

