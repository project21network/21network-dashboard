"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useSeoSubmissions } from "@/lib/hooks/use-seo-submissions";
import { SeoSubmission } from "@/lib/types/seo-submission";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EyeOutlined } from "@ant-design/icons";
import { Badge } from "@/components/ui/badge";
import { updateSeoSubmissionStatus } from "@/lib/firebase/form-helpers";
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

export default function SeoSubmissionsPage() {
  const { submissions, isLoading, error, getSubmission } = useSeoSubmissions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<SeoSubmission | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Funkcja otwierająca dialog i pobierająca dane
  const handleOpenDetails = async (id: string) => {
    try {
      setIsDialogOpen(true);
      setIsLoadingDetails(true);
      setDetailsError(null);
      setCurrentSubmission(null);
      
      console.log(`Fetching details for SEO submission ID: ${id}`);
      const data = await getSubmission(id);
      
      if (!data) {
        setDetailsError(new Error(`Nie znaleziono ankiety SEO o ID: ${id}`));
        setIsLoadingDetails(false);
        return;
      }
      
      console.log("Successfully fetched SEO submission data:", data);
      setCurrentSubmission(data);
      setIsLoadingDetails(false);
    } catch (error) {
      console.error("Error fetching SEO submission details:", error);
      setDetailsError(error instanceof Error ? error : new Error(String(error)));
      setIsLoadingDetails(false);
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
      await updateSeoSubmissionStatus(id, newStatus);
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

  // Funkcja mapująca budżet na czytelną wartość
  const getBudgetLabel = (budget: string, customBudget: string) => {
    if (budget === 'custom' && customBudget) return customBudget;
    
    const budgetMap: Record<string, string> = {
      'low': 'Niski',
      'medium': 'Średni',
      'high': 'Wysoki',
      'enterprise': 'Enterprise'
    };
    
    return budgetMap[budget] || 'Nie określono';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">SEO</h1>
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
        <h1 className="text-2xl font-bold">SEO</h1>
        <Card className="p-6">
          <div className="text-center text-red-500">
            <p>Wystąpił błąd podczas ładowania ankiet SEO.</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">SEO</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista ankiet SEO</CardTitle>
          <CardDescription>
            Wszystkie ankiety SEO przesłane przez klientów
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Brak ankiet SEO do wyświetlenia
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Konkurencja</TableHead>
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
                    <TableCell>
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block ${getStatusColor(submission.status)}`}>
                        {getStatusText(submission.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {submission.competitors?.slice(0, 2).map((competitor, index) => (
                          <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {competitor}
                          </span>
                        ))}
                        {submission.competitors && submission.competitors.length > 2 && (
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            +{submission.competitors.length - 2}
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

      {/* Dialog ze szczegółami ankiety SEO */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseDetails();
        }}
      >
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-white">
          <DialogHeader>
            <DialogTitle>Szczegóły ankiety SEO</DialogTitle>
            <DialogDescription>
              Pełne informacje o wybranej ankiecie SEO
              {currentSubmission && <span className="ml-1 text-xs">(ID: {currentSubmission.id})</span>}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="space-y-4 p-4">
              <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          ) : detailsError ? (
            <div className="p-4 text-center text-red-500">
              <p>Wystąpił błąd podczas ładowania szczegółów ankiety SEO.</p>
              <p className="text-sm">{detailsError.message}</p>
            </div>
          ) : currentSubmission && (
            <ScrollArea className="max-h-[85vh]">
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
              <SeoSubmissionDetails submission={currentSubmission} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Komponent wyświetlający szczegóły ankiety SEO
function SeoSubmissionDetails({ submission }: { submission: SeoSubmission }) {
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
  
  // Mapowanie budżetu na czytelną wartość
  const getBudgetLabel = (budget: string, customBudget: string) => {
    if (budget === 'custom' && customBudget) return customBudget;
    
    const budgetMap: Record<string, string> = {
      'low': 'Niski',
      'medium': 'Średni',
      'high': 'Wysoki',
      'enterprise': 'Enterprise'
    };
    
    return budgetMap[budget] || 'Nie określono';
  };
  
  // Mapowanie ram czasowych na czytelną wartość
  const getTimeframeLabel = (timeframe: string) => {
    const timeframeMap: Record<string, string> = {
      'short': 'Krótki termin (1-3 miesiące)',
      'medium': 'Średni termin (3-6 miesięcy)',
      'long': 'Długi termin (6+ miesięcy)'
    };
    
    return timeframeMap[timeframe] || 'Nie określono';
  };
  
  return (
    <div className="space-y-4 p-4">
      {/* Podstawowe informacje w 3 kolumnach */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolumna 1: Dane podstawowe */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Dane podstawowe</h3>
            <div className="mt-1 space-y-1 text-sm">
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
                <span className="font-medium">URL strony:</span> {renderValue(submission.websiteUrl)}
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
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Budżet i ramy czasowe</h3>
            <div className="mt-1 space-y-1 text-sm">
              <div>
                <span className="font-medium">Budżet:</span> {getBudgetLabel(submission.budget, submission.customBudget)}
              </div>
              <div>
                <span className="font-medium">Ramy czasowe:</span> {getTimeframeLabel(submission.targetTimeframe)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Kolumna 2: Historia SEO i Opis */}
        <div className="space-y-4">
          {/* Historia SEO */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Historia SEO</h3>
            <div className="mt-1 space-y-1 text-sm">
              <div>
                <span className="font-medium">Wcześniejsza współpraca:</span>{" "}
                {submission.seoHistory.previouslyWorked ? "Tak" : "Nie"}
              </div>
              {submission.seoHistory.previouslyWorked && (
                <>
                  {submission.seoHistory.startDate && (
                    <div>
                      <span className="font-medium">Data rozpoczęcia:</span> {renderValue(submission.seoHistory.startDate)}
                    </div>
                  )}
                  {submission.seoHistory.endDate && (
                    <div>
                      <span className="font-medium">Data zakończenia:</span> {renderValue(submission.seoHistory.endDate)}
                    </div>
                  )}
                  {submission.seoHistory.previousAgencies.length > 0 && (
                    <div>
                      <span className="font-medium">Poprzednie agencje:</span>{" "}
                      {submission.seoHistory.previousAgencies.join(", ")}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Opis */}
          {submission.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Opis projektu</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md max-h-[150px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.description)}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Kolumna 3: Oczekiwania i dodatkowe informacje */}
        <div className="space-y-4">
          {/* Oczekiwania */}
          {submission.expectations && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Oczekiwania</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md max-h-[100px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.expectations)}</p>
              </div>
            </div>
          )}
          
          {/* Dodatkowe informacje */}
          {submission.otherInfo && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Dodatkowe informacje</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md max-h-[100px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.otherInfo)}</p>
              </div>
            </div>
          )}
          
          {/* Poprzednie wyniki */}
          {submission.seoHistory.previouslyWorked && submission.seoHistory.previousResults && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Poprzednie wyniki</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md max-h-[100px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.seoHistory.previousResults)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cele SEO */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Cele SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {submission.goals.traffic.length > 0 && (
            <div className="border rounded-md p-2 shadow-sm">
              <h4 className="text-xs font-semibold mb-1">Cele ruchu</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs max-h-[100px] overflow-y-auto">
                {submission.goals.traffic.map((goal, index) => (
                  <li key={`traffic-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
          
          {submission.goals.conversion.length > 0 && (
            <div className="border rounded-md p-2 shadow-sm">
              <h4 className="text-xs font-semibold mb-1">Cele konwersji</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs max-h-[100px] overflow-y-auto">
                {submission.goals.conversion.map((goal, index) => (
                  <li key={`conversion-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
          
          {submission.goals.positions.length > 0 && (
            <div className="border rounded-md p-2 shadow-sm">
              <h4 className="text-xs font-semibold mb-1">Cele pozycji</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs max-h-[100px] overflow-y-auto">
                {submission.goals.positions.map((goal, index) => (
                  <li key={`position-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
          
          {submission.goals.custom.length > 0 && (
            <div className="border rounded-md p-2 shadow-sm">
              <h4 className="text-xs font-semibold mb-1">Cele niestandardowe</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs max-h-[100px] overflow-y-auto">
                {submission.goals.custom.map((goal, index) => (
                  <li key={`custom-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Usługi i słowa kluczowe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lewa kolumna */}
        <div className="space-y-4">
          {/* Wybrane usługi */}
          {submission.selectedServices.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Wybrane usługi SEO</h3>
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1">
                {submission.selectedServices.map((service, index) => (
                  <Badge key={`service-${index}`} variant="secondary" className="px-2 py-0.5 text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Wybrane słowa kluczowe */}
          {submission.selectedKeywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Wybrane słowa kluczowe</h3>
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1">
                {submission.selectedKeywords.map((keyword, index) => (
                  <Badge key={`keyword-${index}`} variant="outline" className="px-2 py-0.5 text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Konkurenci */}
          {submission.competitors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Konkurenci</h3>
              <div className="p-2 bg-gray-50 rounded-md max-h-[100px] overflow-y-auto">
                <ul className="list-disc pl-4 space-y-0.5 text-xs">
                  {submission.competitors.map((competitor, index) => (
                    <li key={`competitor-${index}`}>{competitor}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Prawa kolumna */}
        <div className="space-y-4">
          {/* Niestandardowe słowa kluczowe */}
          {submission.customKeywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Niestandardowe słowa kluczowe</h3>
              <div className="max-h-[150px] overflow-y-auto p-1">
                <div className="grid grid-cols-1 gap-2">
                  {submission.customKeywords.map((keyword, index) => (
                    <div key={`custom-keyword-${index}`} className="border rounded-md p-2 shadow-sm">
                      <div className="font-medium text-xs">{renderValue(keyword.name, "Bez nazwy")}</div>
                      {keyword.description && (
                        <div className="mt-0.5 text-xs">{renderValue(keyword.description)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Wyzwania */}
          {submission.challenges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Wyzwania</h3>
              <div className="p-2 bg-gray-50 rounded-md max-h-[100px] overflow-y-auto">
                <ul className="list-disc pl-4 space-y-0.5 text-xs">
                  {submission.challenges.map((challenge, index) => (
                    <li key={`challenge-${index}`}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 