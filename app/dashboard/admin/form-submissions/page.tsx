"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useFormSubmissions } from "@/lib/hooks/use-form-submissions";
import { FormSubmission } from "@/lib/types/form-submission";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EyeOutlined } from "@ant-design/icons";
import { updateFormSubmissionStatus } from "@/lib/firebase/form-helpers";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Funkcja mapująca status na kolor
function getStatusColor(status: string): string {
  switch (status) {
    case "new": return "bg-blue-100 text-blue-800";
    case "processing": return "bg-yellow-100 text-yellow-800";
    case "completed": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

// Funkcja mapująca status na tekst
function getStatusText(status: string): string {
  switch (status) {
    case "new": return "Nowe";
    case "processing": return "W trakcie";
    case "completed": return "Zakończone";
    default: return status;
  }
}

export default function FormSubmissionsPage() {
  const { submissions, isLoading, error, getSubmission } = useFormSubmissions();
  const [currentSubmission, setCurrentSubmission] = useState<FormSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsError, setDetailsError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Funkcja otwierająca dialog ze szczegółami
  const handleOpenDetails = async (id: string) => {
    setDetailsError(null);
    setIsDialogOpen(true);
    
    try {
      const submission = await getSubmission(id);
      setCurrentSubmission(submission);
    } catch (err) {
      console.error("Error fetching submission details:", err);
      setDetailsError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Funkcja zamykająca dialog
  const handleCloseDetails = () => {
    setIsDialogOpen(false);
    // Resetujemy dane po zamknięciu dialogu
    setTimeout(() => {
      setCurrentSubmission(null);
      setDetailsError(null);
    }, 300);
  };

  // Funkcja zmieniająca status ankiety
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateFormSubmissionStatus(id, newStatus);
      toast.success(`Status ankiety został zmieniony na: ${getStatusText(newStatus)}`);
      
      // Odświeżamy listę ankiet
      setRefreshTrigger(prev => prev + 1);
      
      // Jeśli dialog jest otwarty i pokazuje tę ankietę, odświeżamy też dane w dialogu
      if (isDialogOpen && currentSubmission?.id === id) {
        const updatedSubmission = await getSubmission(id);
        setCurrentSubmission(updatedSubmission);
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji statusu:", error);
      toast.error("Nie udało się zaktualizować statusu ankiety");
    }
  };

  // Efekt odświeżający listę ankiet
  useEffect(() => {
    // Ten efekt będzie wywoływany przy każdej zmianie refreshTrigger
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Ankiety</h1>
        <Card>
          <CardHeader>
            <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded-md"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 w-full bg-gray-200 animate-pulse rounded-md"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Ankiety</h1>
        <Card className="p-6">
          <div className="text-center text-red-500">
            <p>Wystąpił błąd podczas ładowania ankiet.</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ankiety</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista ankiet</CardTitle>
          <CardDescription>
            Wszystkie ankiety przesłane przez klientów
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Brak ankiet do wyświetlenia
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Styl strony</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sekcje</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {submission.createdAt instanceof Date
                        ? format(submission.createdAt, "dd MMM yyyy", { locale: pl })
                        : "Nieznana data"}
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.websiteStyle}</TableCell>
                    <TableCell>
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block ${getStatusColor(submission.status)}`}>
                        {getStatusText(submission.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {submission.selectedSections?.slice(0, 2).map((section, index) => (
                          <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {section}
                          </span>
                        ))}
                        {submission.selectedSections?.length > 2 && (
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            +{submission.selectedSections.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              {getStatusText(submission.status)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white" align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(submission.id, "new")}>
                              Nowe
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(submission.id, "processing")}>
                              W trakcie
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(submission.id, "completed")}>
                              Zakończone
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDetails(submission.id)}
                        >
                          <EyeOutlined />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog ze szczegółami ankiety */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseDetails();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Szczegóły ankiety</DialogTitle>
            <DialogDescription>
              Pełne informacje o ankiecie
              {currentSubmission && <span className="ml-1 text-xs">(ID: {currentSubmission.id})</span>}
            </DialogDescription>
          </DialogHeader>
          
          {detailsError ? (
            <div className="p-4 text-center text-red-500">
              <p>Wystąpił błąd podczas ładowania szczegółów ankiety.</p>
              <p className="text-sm">{detailsError.message}</p>
            </div>
          ) : !currentSubmission ? (
            <div className="p-4 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <ScrollArea className="max-h-[70vh]">
              <div className="p-4 flex justify-between items-center">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentSubmission.status)}`}>
                  Status: {getStatusText(currentSubmission.status)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Zmień status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(currentSubmission.id, "new")}>
                      Nowe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(currentSubmission.id, "processing")}>
                      W trakcie
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(currentSubmission.id, "completed")}>
                      Zakończone
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <SubmissionDetails submission={currentSubmission} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Komponent wyświetlający szczegóły ankiety
function SubmissionDetails({ submission }: { submission: FormSubmission }) {
  // Bezpieczne renderowanie wartości
  const renderValue = (value: any, defaultValue: string = "Nie określono") => {
    return value !== undefined && value !== null && value !== "" ? value : defaultValue;
  };
  
  // Formatowanie daty
  const formatDateValue = (date: any) => {
    if (date instanceof Date) {
      try {
        return format(date, "dd MMMM yyyy, HH:mm", { locale: pl });
      } catch (error) {
        return "Błąd formatu daty";
      }
    }
    return "Nieznana data";
  };
  
  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Dane podstawowe</h3>
            <div className="mt-2 space-y-2">
              <div>
                <span className="font-medium">ID:</span> {submission.id}
              </div>
              <div>
                <span className="font-medium">Nazwa:</span> {renderValue(submission.name)}
              </div>
              <div>
                <span className="font-medium">Email:</span> {renderValue(submission.email)}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block ${getStatusColor(submission.status)}`}>
                  {getStatusText(submission.status)}
                </span>
              </div>
              <div>
                <span className="font-medium">Data utworzenia:</span>{" "}
                {formatDateValue(submission.createdAt)}
              </div>
              {submission.updatedAt && (
                <div>
                  <span className="font-medium">Data aktualizacji:</span>{" "}
                  {formatDateValue(submission.updatedAt)}
                </div>
              )}
            </div>
          </div>
          
          {/* Opis */}
          {submission.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Opis projektu</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.description)}</p>
              </div>
            </div>
          )}
          
          {/* Ustawienia strony */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Ustawienia strony</h3>
            <div className="mt-2 space-y-2">
              <div>
                <span className="font-medium">Styl strony:</span> {renderValue(submission.websiteStyle)}
              </div>
              <div>
                <span className="font-medium">Typ treści:</span> {renderValue(submission.contentType)}
              </div>
              <div>
                <span className="font-medium">Schemat kolorów:</span> {renderValue(submission.colorScheme)}
              </div>
              <div>
                <span className="font-medium">Typ zdjęć:</span> {renderValue(submission.photoType)}
              </div>
              <div>
                <span className="font-medium">Opcja domeny:</span> {renderValue(submission.domainOption)}
              </div>
              {submission.domainOption === 'own' && (
                <div>
                  <span className="font-medium">Własna domena:</span> {renderValue(submission.ownDomain)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Wybrane sekcje */}
          {submission.selectedSections?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Wybrane sekcje</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {submission.selectedSections.map((section, index) => (
                  <div key={`section-${index}`} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                    {section}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Niestandardowe kolory */}
          {submission.customColors && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Niestandardowe kolory</h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: submission.customColors.primary || '#cccccc' }}
                  ></div>
                  <span className="text-xs">Podstawowy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: submission.customColors.secondary || '#cccccc' }}
                  ></div>
                  <span className="text-xs">Drugorzędny</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: submission.customColors.accent || '#cccccc' }}
                  ></div>
                  <span className="text-xs">Akcentowy</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Niestandardowe sekcje */}
      {submission.customSections?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Niestandardowe sekcje</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {submission.customSections.map((section, index) => (
              <div key={`custom-section-${index}`} className="border rounded-md p-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold">{renderValue(section.name, `Sekcja ${index + 1}`)}</h4>
                  {section.price > 0 && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{section.price} PLN</span>
                  )}
                </div>
                {section.description && (
                  <p className="mt-1 text-xs">{section.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 