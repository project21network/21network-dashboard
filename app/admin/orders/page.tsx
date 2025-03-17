import { DataTable } from "@/components/ui/data-table";
import { columns, Order } from "./columns";

export default async function OrdersPage() {
  // TODO: Fetch orders from Firebase
  const orders: Order[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Zamówienia</h1>
      </div>
      
      <DataTable columns={columns} data={orders} />
    </div>
  );
} 