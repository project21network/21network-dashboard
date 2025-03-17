"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useClients } from "@/lib/hooks/use-clients";
import { UserProfile } from "@/lib/types/user";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { SearchOutlined, UserOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import { Eye, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

export default function AdminClientsPage() {
  const { clients, isLoading, updateClient, deleteClient } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<UserProfile | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  
  // Filter clients based on search query
  const filteredClients = clients.filter(client => 
    client.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewClient = (client: UserProfile) => {
    setSelectedClient(client);
    setIsEditMode(false);
  };
  
  const handleEditClient = (client: UserProfile) => {
    setSelectedClient(client);
    setEditFormData({
      displayName: client.displayName,
      company: client.company || "",
      phone: client.phone || "",
    });
    setIsEditMode(true);
  };
  
  const handleDeleteClient = (client: UserProfile) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setSelectedClient(null);
    setIsEditMode(false);
    setEditFormData({});
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveChanges = async () => {
    if (!selectedClient) return;
    
    try {
      const success = await updateClient(selectedClient.uid, editFormData);
      
      if (success) {
        toast.success("Dane klienta zostały zaktualizowane");
        setIsEditMode(false);
        setSelectedClient(prev => prev ? { ...prev, ...editFormData } : null);
      } else {
        toast.error("Nie udało się zaktualizować danych klienta");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji danych");
      console.error("Error updating client:", error);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedClient) return;
    
    try {
      const success = await deleteClient(selectedClient.uid);
      
      if (success) {
        toast.success("Klient został usunięty");
        setIsDeleteDialogOpen(false);
        setSelectedClient(null);
      } else {
        toast.error("Nie udało się usunąć klienta");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas usuwania klienta");
      console.error("Error deleting client:", error);
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
      <h1 className="text-2xl font-bold mb-6">Zarządzanie klientami</h1>
      
      <div className="mb-6">
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Szukaj klientów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista klientów</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imię i nazwisko</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Data rejestracji</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Brak klientów spełniających kryteria wyszukiwania
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.uid}>
                    <TableCell className="font-medium">{client.displayName}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.company || "—"}</TableCell>
                    <TableCell>
                      {format(client.createdAt, "dd MMM yyyy", { locale: pl })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreOutlined />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white shadow-lg border border-gray-200">
                          <DropdownMenuItem onClick={() => handleViewClient(client)} className="hover:bg-gray-50">
                            <Eye className="mr-2 h-4 w-4" /> Podgląd
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClient(client)} className="hover:bg-gray-50">
                            <Edit className="mr-2 h-4 w-4" /> Edytuj
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClient(client)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Usuń
                          </DropdownMenuItem>
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
      
      {/* Dialog ze szczegółami klienta */}
      <Dialog open={!!selectedClient && !isDeleteDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edycja klienta" : "Szczegóły klienta"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Edytuj dane wybranego klienta" 
                : "Informacje o wybranym kliencie"
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-6">
                {selectedClient.photoURL ? (
                  <img 
                    src={selectedClient.photoURL} 
                    alt={selectedClient.displayName}
                    className="rounded-full w-28 h-28 object-cover border-2 border-gray-100 shadow-sm" 
                  />
                ) : (
                  <div className="rounded-full w-28 h-28 bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-100 shadow-sm">
                    <UserOutlined style={{ fontSize: 36 }} />
                  </div>
                )}
              </div>
              
              {isEditMode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Imię i nazwisko</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={editFormData.displayName || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Firma</Label>
                    <Input
                      id="company"
                      name="company"
                      value={editFormData.company || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={editFormData.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Imię i nazwisko</div>
                    <div className="font-medium">{selectedClient.displayName}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                    <div className="font-medium">{selectedClient.email}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Firma</div>
                    <div>{selectedClient.company || "—"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Telefon</div>
                    <div>{selectedClient.phone || "—"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Data rejestracji</div>
                    <div>
                      {format(selectedClient.createdAt, "dd MMMM yyyy, HH:mm", { locale: pl })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Ostatnie logowanie</div>
                    <div>
                      {selectedClient.lastLogin
                        ? format(selectedClient.lastLogin, "dd MMMM yyyy, HH:mm", { locale: pl })
                        : "—"
                      }
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 mt-4">
                {isEditMode ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditMode(false)}>
                      Anuluj
                    </Button>
                    <Button onClick={handleSaveChanges}>
                      Zapisz zmiany
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Zamknij
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => handleEditClient(selectedClient)}
                    >
                      Edytuj
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog potwierdzenia usunięcia */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tego klienta? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedClient && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-4">
                <p className="text-red-800 font-medium">
                  Usuwasz klienta: {selectedClient.displayName}
                </p>
                <p className="text-red-700 text-sm mt-1">
                  Email: {selectedClient.email}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Usuń klienta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}