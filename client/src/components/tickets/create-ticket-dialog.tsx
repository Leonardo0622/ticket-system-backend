import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { getApiErrorMessage } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { priorityLabel } from "./ticket-badges";
import type { TicketPriority, UserOption } from "./types";

interface CreateTicketPayload {
  title: string;
  description: string;
  priority?: TicketPriority;
  assignedTo?: string | null;
}

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  agents: UserOption[];
}

async function createTicket(data: CreateTicketPayload) {
  const res = await api.post("/tickets/create", data);
  return res.data.ticket;
}

const NONE = "__none__";

export function CreateTicketDialog({
  open,
  onOpenChange,
  isAdmin,
  agents
}: CreateTicketDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("low");
  const [assignedTo, setAssignedTo] = useState<string>(NONE);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setPriority("low");
      setAssignedTo(NONE);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket creado correctamente");
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Error al crear el ticket"))
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const payload: CreateTicketPayload = {
      title: title.trim(),
      description
    };

    if (isAdmin) {
      payload.priority = priority;
      if (assignedTo !== NONE) {
        payload.assignedTo = assignedTo;
      }
    }

    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo ticket</DialogTitle>
          <DialogDescription>
            Describe el problema o solicitud para que el equipo pueda
            atenderlo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ticket-title">Título</Label>
            <Input
              id="ticket-title"
              placeholder="Resumen corto del problema"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ticket-description">Descripción</Label>
            <Textarea
              id="ticket-description"
              rows={4}
              required
              minLength={10}
              placeholder="Explica el detalle (mínimo 10 caracteres)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {isAdmin && (
            <div className="grid gap-2">
              <Label>Prioridad</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TicketPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {isAdmin && (
            <div className="grid gap-2">
              <Label>Asignar agente</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value={NONE}>Sin asignar</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.name} ({a.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agents.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hay agentes registrados todavía.
                </p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Crear ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
