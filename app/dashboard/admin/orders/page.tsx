"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrders } from "@/lib/hooks/use-orders";
import { Order, OrderStatus } from "@/lib/types/order";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { SearchOutlined, MoreOutlined } from "@ant-design/icons";
import { toast } from "sonner";

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "new": return "bg-blue-100 text-blue-800";
    case "processing": return "bg-yellow-100 text-yellow-800";
    case "completed": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getStatusText(status: OrderStatus): string {
  switch (status) {
    case "new": return "Nowe";
    case "processing": return "W trakcie";
    case "completed": return "Zakończone";
    case "cancelled": return "Anulowane";
    default: return status;
  }
}

export default function AdminOrdersPage() {
  const { orders, isLoading, updateOrderStatus } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateStatusLoading, setIsUpdateStatusLoading] = useState(false);
  
  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };
  
  const handleCloseDialog = () => {
    setSelectedOrder(null);
  };
  
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdateStatusLoading(true);
    
    try {
      const success = await updateOrderStatus(orderId, newStatus);
      
      if (success) {
        toast.success(`Status zamówienia został zmieniony na: ${getStatusText(newStatus)}`);
        
        // Update the selected order if it's currently being viewed
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: newStatus,
            updatedAt: new Date(),
            ...(newStatus === "completed" ? { completedAt: new Date() } : {})
          });
        }
      } else {
        toast.error("Nie udało się zaktualizować statusu zamówienia");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Wystąpił błąd podczas aktualizacji statusu zamówienia");
    } finally {
      setIsUpdateStatusLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Przegląd zamówień</h1>
      
      <div className="mb-6">
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Szukaj zamówień..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista zamówień</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tytuł</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kwota</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Brak zamówień spełniających kryteria wyszukiwania
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.title}</TableCell>
                    <TableCell>{order.userName}</TableCell>
                    <TableCell>
                      {format(order.createdAt, "dd MMM yyyy", { locale: pl })}
                    </TableCell>
                    <TableCell>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreOutlined />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            Szczegóły
                          </DropdownMenuItem>
                          {order.status === "new" && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.id, "processing")}
                              disabled={isUpdateStatusLoading}
                            >
                              Oznacz jako "W trakcie"
                            </DropdownMenuItem>
                          )}
                          {order.status === "processing" && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.id, "completed")}
                              disabled={isUpdateStatusLoading}
                            >
                              Oznacz jako "Zakończone"
                            </DropdownMenuItem>
                          )}
                          {(order.status === "new" || order.status === "processing") && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(order.id, "cancelled")}
                              disabled={isUpdateStatusLoading}
                              className="text-red-600"
                            >
                              Anuluj zamówienie
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialog ze szczegółami zamówienia */}
      <Dialog open={!!selectedOrder} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Szczegóły zamówienia</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>ID: {selectedOrder.id}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Klient</div>
                  <div>{selectedOrder.userName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Data utworzenia</div>
                  <div>{format(selectedOrder.createdAt, "dd MMMM yyyy, HH:mm", { locale: pl })}</div>
                </div>
                {selectedOrder.completedAt && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Data zakończenia</div>
                    <div>{format(selectedOrder.completedAt, "dd MMMM yyyy, HH:mm", { locale: pl })}</div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium text-muted-foreground">Tytuł</div>
                <div className="text-lg font-medium">{selectedOrder.title}</div>
              </div>
              
              <div className="mb-6">
                <div className="text-sm font-medium text-muted-foreground">Opis</div>
                <div>{selectedOrder.description}</div>
              </div>
              
              <div className="mb-6">
                <div className="text-sm font-medium text-muted-foreground mb-2">Elementy zamówienia</div>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nazwa</TableHead>
                        <TableHead className="text-right">Cena</TableHead>
                        <TableHead className="text-right">Ilość</TableHead>
                        <TableHead className="text-right">Suma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium">Razem: {formatCurrency(selectedOrder.totalAmount)}</div>
                
                <div className="space-x-2">
                  {selectedOrder.status === "new" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                      disabled={isUpdateStatusLoading}
                    >
                      Oznacz jako "W trakcie"
                    </Button>
                  )}
                  {selectedOrder.status === "processing" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}
                      disabled={isUpdateStatusLoading}
                    >
                      Oznacz jako "Zakończone"
                    </Button>
                  )}
                  {(selectedOrder.status === "new" || selectedOrder.status === "processing") && (
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}
                      disabled={isUpdateStatusLoading}
                    >
                      Anuluj zamówienie
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}