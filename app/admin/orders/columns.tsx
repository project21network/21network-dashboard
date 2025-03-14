"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export interface Order {
  id: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  total: number;
  createdAt: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const statusMap = {
  pending: "Oczekujące",
  processing: "W realizacji",
  completed: "Zakończone",
  cancelled: "Anulowane",
} as const;

const statusColors = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
} as const;

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "userId",
    header: "ID Użytkownika",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusMap;
      return (
        <Badge className={statusColors[status]}>
          {statusMap[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Suma",
    cell: ({ row }) => {
      const total = row.getValue("total") as number;
      return `${total.toFixed(2)} zł`;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(date, "dd MMMM yyyy", { locale: pl });
    },
  },
  {
    accessorKey: "items",
    header: "Produkty",
    cell: ({ row }) => {
      const items = row.getValue("items") as Order["items"];
      return items.map(item => `${item.name} (${item.quantity}x)`).join(", ");
    },
  },
]; 