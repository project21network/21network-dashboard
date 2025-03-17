"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/lib/hooks/use-orders";
import { Order, OrderStatus } from "@/lib/types/order";
import { formatDistanceToNow, format } from "date-fns";
import { pl } from "date-fns/locale";
import { useAuth } from "@/lib/hooks/use-auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SeoSubmission, SeoKeyword } from "@/lib/types/seo-submission";
import { FormSubmission, CustomColor, CustomSection } from "@/lib/types/form-submission";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface Competitor {
  url: string;
  notes?: string;
  id: string;
}

interface CustomGoal {
  description: string;
  id: string;
}

interface CustomService {
  id: string;
  name: string;
  description?: string;
}

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

// Funkcja mapująca status na kolor
function getSubmissionStatusColor(status: string): string {
  switch (status) {
    case "new": return "bg-blue-100 text-blue-800";
    case "processing": return "bg-yellow-100 text-yellow-800";
    case "completed": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

// Funkcja mapująca status na tekst
function getSubmissionStatusText(status: string): string {
  switch (status) {
    case "new": return "Nowe";
    case "processing": return "W trakcie";
    case "completed": return "Zakończone";
    default: return status;
  }
}

export default function ClientOrdersPage() {
  const { orders, isLoading } = useOrders();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [seoSubmissions, setSeoSubmissions] = useState<SeoSubmission[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [isLoadingSeo, setIsLoadingSeo] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [selectedSeoSubmission, setSelectedSeoSubmission] = useState<SeoSubmission | null>(null);
  const [selectedFormSubmission, setSelectedFormSubmission] = useState<FormSubmission | null>(null);
  const [isSeoDialogOpen, setIsSeoDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [indexErrors, setIndexErrors] = useState<string[]>([]);
  
  // Pobieranie ankiet SEO dla zalogowanego użytkownika
  useEffect(() => {
    async function fetchSeoSubmissions() {
      if (!user?.email) {
        setSeoSubmissions([]);
        setIsLoadingSeo(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, "seoFormSubmissions"),
          where("email", "==", user.email),
          orderBy("createdAt", "desc")
        );
        
        const snapshot = await getDocs(q);
        const submissions: SeoSubmission[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined;
          
          submissions.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            description: data.description || '',
            websiteUrl: data.websiteUrl || '',
            createdAt,
            updatedAt,
            budget: data.budget || '',
            customBudget: data.customBudget || '',
            goals: {
              traffic: Array.isArray(data.goals?.traffic) ? data.goals.traffic : [],
              conversion: Array.isArray(data.goals?.conversion) ? data.goals.conversion : [],
              positions: Array.isArray(data.goals?.positions) ? data.goals.positions : [],
              custom: Array.isArray(data.goals?.custom) ? data.goals.custom : [],
            },
            expectations: data.expectations || '',
            otherInfo: data.otherInfo || '',
            selectedServices: Array.isArray(data.selectedServices) ? data.selectedServices : [],
            customServices: Array.isArray(data.customServices) ? data.customServices : [],
            selectedKeywords: Array.isArray(data.selectedKeywords) ? data.selectedKeywords : [],
            customKeywords: Array.isArray(data.customKeywords) ? data.customKeywords : [],
            competitors: Array.isArray(data.competitors) ? data.competitors : [],
            challenges: Array.isArray(data.challenges) ? data.challenges : [],
            additionalInfo: data.additionalInfo || {},
            seoHistory: {
              previouslyWorked: !!data.seoHistory?.previouslyWorked,
              startDate: data.seoHistory?.startDate || '',
              endDate: data.seoHistory?.endDate || '',
              previousAgencies: Array.isArray(data.seoHistory?.previousAgencies) ? data.seoHistory.previousAgencies : [],
              previousResults: data.seoHistory?.previousResults || '',
            },
            targetTimeframe: data.targetTimeframe || '',
            status: data.status || 'new',
          });
        });
        
        setSeoSubmissions(submissions);
      } catch (error) {
        console.error("Błąd podczas pobierania ankiet SEO:", error);
        if (error instanceof Error && error.message.includes("requires an index")) {
          setIndexErrors(prev => [...prev, error.message]);
        }
      } finally {
        setIsLoadingSeo(false);
      }
    }
    
    fetchSeoSubmissions();
  }, [user]);
  
  // Pobieranie formularzy stron dla zalogowanego użytkownika
  useEffect(() => {
    async function fetchFormSubmissions() {
      if (!user?.email) {
        setFormSubmissions([]);
        setIsLoadingForm(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, "formSubmissions"),
          where("email", "==", user.email),
          orderBy("createdAt", "desc")
        );
        
        const snapshot = await getDocs(q);
        const submissions: FormSubmission[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined;
          
          submissions.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            description: data.description || '',
            createdAt,
            updatedAt,
            colorScheme: data.colorScheme || '',
            contentType: data.contentType || '',
            customColors: data.customColors || { primary: '', secondary: '', accent: '' },
            customSections: Array.isArray(data.customSections) ? data.customSections : [],
            domainOption: data.domainOption || '',
            ownDomain: data.ownDomain || '',
            photoType: data.photoType || '',
            selectedSections: Array.isArray(data.selectedSections) ? data.selectedSections : [],
            websiteStyle: data.websiteStyle || '',
            status: data.status || 'new',
          });
        });
        
        setFormSubmissions(submissions);
      } catch (error) {
        console.error("Błąd podczas pobierania formularzy stron:", error);
        if (error instanceof Error && error.message.includes("requires an index")) {
          setIndexErrors(prev => [...prev, error.message]);
        }
      } finally {
        setIsLoadingForm(false);
      }
    }
    
    fetchFormSubmissions();
  }, [user]);
  
  // Filtrowanie zamówień według statusu
  const filterOrdersByStatus = (status: string): Order[] => {
    if (status === "all") return orders;
    return orders.filter(order => order.status === status);
  };
  
  // Filtrowanie ankiet SEO według statusu
  const filterSeoSubmissionsByStatus = (status: string): SeoSubmission[] => {
    if (status === "all") return seoSubmissions;
    if (status === "seo") return seoSubmissions;
    return seoSubmissions.filter(submission => submission.status === status);
  };
  
  // Filtrowanie ankiet WWW według statusu
  const filterFormSubmissionsByStatus = (status: string): FormSubmission[] => {
    if (status === "all") return formSubmissions;
    if (status === "form") return formSubmissions;
    return formSubmissions.filter(submission => submission.status === status);
  };
  
  // Funkcje obsługujące dialog z ankietami SEO
  const handleOpenSeoDetails = (submission: SeoSubmission) => {
    console.log('Opening SEO details:', JSON.stringify(submission, null, 2));
    setSelectedSeoSubmission(submission);
    setIsSeoDialogOpen(true);
  };
  
  const handleCloseSeoDetails = () => {
    setIsSeoDialogOpen(false);
    setTimeout(() => {
      setSelectedSeoSubmission(null);
    }, 300);
  };
  
  // Funkcje obsługujące dialog z formularzami stron
  const handleOpenFormDetails = (submission: FormSubmission) => {
    setSelectedFormSubmission(submission);
    setIsFormDialogOpen(true);
  };
  
  const handleCloseFormDetails = () => {
    setIsFormDialogOpen(false);
    setTimeout(() => {
      setSelectedFormSubmission(null);
    }, 300);
  };
  
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
  
  if (isLoading || isLoadingSeo || isLoadingForm) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Moje zamówienia</h1>
      
      {indexErrors.length > 0 && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-center gap-2 text-red-800 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Uwaga</span>
          </div>
          <div className="mt-2 text-red-700">
            <p>Wystąpiły błędy związane z indeksami Firebase. Administrator musi utworzyć następujące indeksy:</p>
            <ul className="list-disc pl-5 mt-2 text-xs">
              {indexErrors.map((error, index) => (
                <li key={index}>
                  {error.includes("https") ? (
                    <a 
                      href={error.split("https")[1].split('"')[0] ? "https" + error.split("https")[1].split('"')[0] : "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Utwórz indeks
                    </a>
                  ) : error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
          <TabsTrigger value="new">Nowe</TabsTrigger>
          <TabsTrigger value="processing">W trakcie</TabsTrigger>
          <TabsTrigger value="completed">Zakończone</TabsTrigger>
          <TabsTrigger value="seo" className="relative">
            SEO
            {seoSubmissions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {seoSubmissions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="form" className="relative">
            WWW
            {formSubmissions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {formSubmissions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Zakładka z zamówieniami */}
        {activeTab !== "seo" && activeTab !== "form" && (
          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {/* Zamówienia */}
              {filterOrdersByStatus(activeTab).length > 0 && (
                <>
                  <h2 className="text-lg font-semibold mb-2">Zamówienia</h2>
                  {filterOrdersByStatus(activeTab).map(order => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{order.title}</CardTitle>
                            <CardDescription>
                              Utworzono {formatDistanceToNow(order.createdAt, { addSuffix: true, locale: pl })}
                            </CardDescription>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-2">
                          <p className="text-sm text-gray-700">{order.description}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="text-sm font-medium">
                              Kwota: {order.totalAmount.toFixed(2)} PLN
                            </div>
                            <Button variant="outline" size="sm">Szczegóły</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
              
              {/* Ankiety SEO w zakładce Wszystkie lub filtrowane według statusu */}
              {(activeTab === "all" || filterSeoSubmissionsByStatus(activeTab).length > 0) && (
                <>
                  {activeTab === "all" && <h2 className="text-lg font-semibold mb-2 mt-6">SEO</h2>}
                  {filterSeoSubmissionsByStatus(activeTab).map(submission => (
                    <Card key={submission.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>SEO - Zamówienie: {submission.websiteUrl}</CardTitle>
                            <CardDescription>
                              Utworzono {formatDistanceToNow(submission.createdAt, { addSuffix: true, locale: pl })}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                              {getSubmissionStatusText(submission.status)}
                            </div>
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              SEO
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Budżet:</span> {getBudgetLabel(submission.budget, submission.customBudget)}
                            </div>
                            <div>
                              <span className="font-medium">Usługi:</span> {submission.selectedServices.slice(0, 2).join(", ")}
                              {submission.selectedServices.length > 2 && ` +${submission.selectedServices.length - 2}`}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenSeoDetails(submission)}
                            >
                              Szczegóły
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
              
              {/* Ankiety WWW w zakładce Wszystkie lub filtrowane według statusu */}
              {(activeTab === "all" || filterFormSubmissionsByStatus(activeTab).length > 0) && (
                <>
                  {activeTab === "all" && <h2 className="text-lg font-semibold mb-2 mt-6">WWW</h2>}
                  {filterFormSubmissionsByStatus(activeTab).map(submission => (
                    <Card key={submission.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>WWW - Zamówienie: {submission.name}</CardTitle>
                            <CardDescription>
                              Utworzono {formatDistanceToNow(submission.createdAt, { addSuffix: true, locale: pl })}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                              {getSubmissionStatusText(submission.status)}
                            </div>
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              WWW
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-sm font-medium">Styl strony:</span> {submission.websiteStyle || "Nie określono"}
                            </div>
                            <div>
                              <span className="text-sm font-medium">Sekcje:</span> {submission.selectedSections?.slice(0, 2).join(", ")}
                              {submission.selectedSections?.length > 2 && ` +${submission.selectedSections.length - 2}`}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenFormDetails(submission)}
                            >
                              Szczegóły
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
              
              {/* Komunikat o braku danych */}
              {activeTab === "all" && 
               filterOrdersByStatus(activeTab).length === 0 && 
               filterSeoSubmissionsByStatus(activeTab).length === 0 && 
               filterFormSubmissionsByStatus(activeTab).length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Brak zamówień i ankiet</p>
                  </CardContent>
                </Card>
              )}
              
              {activeTab !== "all" && 
               activeTab !== "seo" && 
               activeTab !== "form" && 
               filterOrdersByStatus(activeTab).length === 0 && 
               filterSeoSubmissionsByStatus(activeTab).length === 0 && 
               filterFormSubmissionsByStatus(activeTab).length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Brak zamówień i ankiet w tej kategorii</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}
        
        {/* Zakładka z ankietami SEO */}
        <TabsContent value="seo">
          <div className="space-y-4">
            {seoSubmissions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nie masz jeszcze żadnych ankiet SEO</p>
                </CardContent>
              </Card>
            ) : (
              seoSubmissions.map(submission => (
                <Card key={submission.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Ankieta SEO: {submission.websiteUrl}</CardTitle>
                        <CardDescription>
                          Utworzono {formatDistanceToNow(submission.createdAt, { addSuffix: true, locale: pl })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                          {getSubmissionStatusText(submission.status)}
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          SEO
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Budżet:</span> {getBudgetLabel(submission.budget, submission.customBudget)}
                        </div>
                        <div>
                          <span className="font-medium">Usługi:</span> {submission.selectedServices.slice(0, 2).join(", ")}
                          {submission.selectedServices.length > 2 && ` +${submission.selectedServices.length - 2}`}
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenSeoDetails(submission)}
                        >
                          Szczegóły
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Zakładka z formularzami stron */}
        <TabsContent value="form">
          <div className="space-y-4">
            {formSubmissions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nie masz jeszcze żadnych ankiet WWW</p>
                </CardContent>
              </Card>
            ) : (
              formSubmissions.map(submission => (
                <Card key={submission.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Ankieta WWW: {submission.name}</CardTitle>
                        <CardDescription>
                          Utworzono {formatDistanceToNow(submission.createdAt, { addSuffix: true, locale: pl })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                          {getSubmissionStatusText(submission.status)}
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          WWW
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-sm font-medium">Styl strony:</span> {submission.websiteStyle || "Nie określono"}
                        </div>
                        <div>
                          <span className="text-sm font-medium">Typ treści:</span> {submission.contentType || "Nie określono"}
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenFormDetails(submission)}
                        >
                          Szczegóły
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog ze szczegółami ankiety SEO */}
      <Dialog 
        open={isSeoDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseSeoDetails();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader>
            <DialogTitle>Szczegóły ankiety SEO</DialogTitle>
            <DialogDescription>
              Pełne informacje o Twojej ankiecie SEO
              {selectedSeoSubmission && <span className="ml-1 text-xs">(ID: {selectedSeoSubmission.id})</span>}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeoSubmission && (
            <ScrollArea className="max-h-[80vh]">
              <ClientSeoSubmissionDetails submission={selectedSeoSubmission} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog ze szczegółami formularza strony */}
      <Dialog 
        open={isFormDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseFormDetails();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader>
            <DialogTitle>Szczegóły ankiety WWW</DialogTitle>
            <DialogDescription>
              Pełne informacje o Twojej ankiecie WWW
              {selectedFormSubmission && <span className="ml-1 text-xs">(ID: {selectedFormSubmission.id})</span>}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFormSubmission && (
            <ScrollArea className="max-h-[80vh]">
              <ClientFormSubmissionDetails submission={selectedFormSubmission} />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Komponent wyświetlający szczegóły ankiety SEO dla klienta
function ClientSeoSubmissionDetails({ submission }: { submission: any }): React.JSX.Element {
  console.log("Rendering SEO details:", submission);

  // Bezpieczne renderowanie wartości
  function renderValue(value: any): React.ReactNode {
    console.log("Rendering value:", value);
    
    // Obsługa wartości undefined, null lub pusty string
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400">Nie podano</span>;
    }
    
    // Obsługa tablic
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400">Nie podano</span>;
      }
      
      return value.map((item, index) => (
        <span key={index} className="mr-2">
          {renderValue(item)}
          {index < value.length - 1 ? ', ' : ''}
        </span>
      ));
    }
    
    // Obsługa obiektów
    if (typeof value === 'object') {
      // Obsługa SeoGoals
      if ('traffic' in value || 'conversion' in value || 'positions' in value || 'custom' in value) {
        return <span className="text-gray-400">Szczegóły poniżej</span>;
      }
      
      // Obsługa obiektów z URL
      if ('url' in value) {
        return value.url;
      }
      
      // Obsługa obiektów z nazwą
      if ('name' in value) {
        return value.name;
      }
      
      // Obsługa obiektów z opisem
      if ('description' in value) {
        return value.description;
      }
      
      // Dla innych obiektów, próbujemy wyciągnąć pierwszą wartość
      const values = Object.values(value);
      if (values.length > 0 && values[0] !== null && values[0] !== undefined) {
        return String(values[0]);
      }
      
      return <span className="text-gray-400">Złożony obiekt</span>;
    }
    
    // Obsługa innych typów
    return String(value);
  }

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
    <div className="space-y-6">
      {/* Podstawowe dane */}
      <div>
        <h3 className="text-lg font-medium">Podstawowe dane</h3>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">URL strony</p>
            <p className="mt-1">{renderValue(submission.websiteUrl)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Opis</p>
            <p className="mt-1">{renderValue(submission.description)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Budżet</p>
            <p className="mt-1">{renderValue(submission.budget)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Czas realizacji</p>
            <p className="mt-1">{renderValue(submission.timeframe)}</p>
          </div>
          {submission.createdAt && (
            <div>
              <p className="text-sm font-medium text-gray-500">Data utworzenia</p>
              <p className="mt-1">{formatDateValue(submission.createdAt)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Oczekiwania */}
      {submission.expectations && (
        <div>
          <h3 className="text-lg font-medium">Oczekiwania</h3>
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-500">Oczekiwania</p>
            <p className="mt-1">{renderValue(submission.expectations)}</p>
          </div>
        </div>
      )}

      {/* Wybrane usługi */}
      {submission.selectedServices && submission.selectedServices.length > 0 && (
        <div>
          <h3 className="text-lg font-medium">Wybrane usługi</h3>
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {submission.selectedServices.map((service: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {renderValue(service)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Słowa kluczowe */}
      <div>
        <h3 className="text-lg font-medium">Słowa kluczowe</h3>
        
        {/* Wybrane słowa kluczowe */}
        {submission.selectedKeywords && submission.selectedKeywords.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-500">Wybrane słowa kluczowe</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {submission.selectedKeywords.map((keyword: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {renderValue(keyword)}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Własne słowa kluczowe */}
        {Array.isArray(submission.customKeywords) && submission.customKeywords.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-500">Własne słowa kluczowe</p>
            <div className="space-y-2 mt-1">
              {submission.customKeywords.map((keyword: any, index: number) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">{renderValue(keyword.name)}</p>
                  {keyword.description && (
                    <p className="text-sm text-gray-600 mt-1">{renderValue(keyword.description)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cele */}
      {submission.goals && (
        <div>
          <h3 className="text-lg font-medium">Cele</h3>
          <div className="mt-2 space-y-3">
            {submission.goals.traffic && submission.goals.traffic.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500">Cele ruchu</p>
                <ul className="list-disc pl-5 mt-1">
                  {submission.goals.traffic.map((goal: string, index: number) => (
                    <li key={`traffic-${index}`} className="text-sm">{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {submission.goals.conversion && submission.goals.conversion.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500">Cele konwersji</p>
                <ul className="list-disc pl-5 mt-1">
                  {submission.goals.conversion.map((goal: string, index: number) => (
                    <li key={`conversion-${index}`} className="text-sm">{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {submission.goals.positions && submission.goals.positions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500">Cele pozycji</p>
                <ul className="list-disc pl-5 mt-1">
                  {submission.goals.positions.map((goal: string, index: number) => (
                    <li key={`position-${index}`} className="text-sm">{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {submission.goals.custom && submission.goals.custom.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500">Cele niestandardowe</p>
                <ul className="list-disc pl-5 mt-1">
                  {submission.goals.custom.map((goal: any, index: number) => (
                    <li key={`custom-${index}`} className="text-sm">
                      {typeof goal === 'object' && goal !== null && 'description' in goal
                        ? goal.description
                        : String(goal)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {(!submission.goals.traffic || submission.goals.traffic.length === 0) &&
             (!submission.goals.conversion || submission.goals.conversion.length === 0) &&
             (!submission.goals.positions || submission.goals.positions.length === 0) &&
             (!submission.goals.custom || submission.goals.custom.length === 0) && (
              <p className="text-gray-400">Nie podano celów</p>
            )}
          </div>
        </div>
      )}

      {/* Dodatkowe informacje */}
      {submission.additionalInfo && (
        <div>
          <h3 className="text-lg font-medium">Dodatkowe informacje</h3>
          <div className="mt-2 space-y-3">
            {typeof submission.additionalInfo === 'object' && submission.additionalInfo !== null ? (
              <>
                {submission.additionalInfo.text && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Informacje</p>
                    <p className="mt-1">{submission.additionalInfo.text}</p>
                  </div>
                )}
                
                {submission.additionalInfo.expectations && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Oczekiwania</p>
                    <p className="mt-1">{submission.additionalInfo.expectations}</p>
                  </div>
                )}
                
                {submission.additionalInfo.otherInfo && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inne informacje</p>
                    <p className="mt-1">{submission.additionalInfo.otherInfo}</p>
                  </div>
                )}
                
                {submission.additionalInfo.challenges && Array.isArray(submission.additionalInfo.challenges) && submission.additionalInfo.challenges.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Wyzwania</p>
                    <ul className="list-disc pl-5 mt-1">
                      {submission.additionalInfo.challenges.map((challenge: any, index: number) => (
                        <li key={`challenge-${index}`} className="text-sm">
                          {typeof challenge === 'object' && challenge !== null
                            ? String(Object.values(challenge)[0] || '')
                            : String(challenge)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {!submission.additionalInfo.text && 
                 !submission.additionalInfo.expectations && 
                 !submission.additionalInfo.otherInfo && 
                 (!submission.additionalInfo.challenges || !Array.isArray(submission.additionalInfo.challenges) || submission.additionalInfo.challenges.length === 0) && (
                  <p className="text-gray-400">Brak dodatkowych informacji</p>
                )}
              </>
            ) : (
              <p>{String(submission.additionalInfo || '')}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Konkurenci */}
      {submission.competitors && submission.competitors.length > 0 && (
        <div>
          <h3 className="text-lg font-medium">Konkurenci</h3>
          <div className="mt-2">
            <ul className="list-disc pl-5">
              {submission.competitors.map((competitor: any, index: number) => (
                <li key={`competitor-${index}`} className="mb-2">
                  {typeof competitor === 'object' && competitor !== null && 'url' in competitor ? (
                    <>
                      <div className="font-medium">{competitor.url}</div>
                      {competitor.notes && (
                        <div className="text-sm text-gray-600 mt-1">{competitor.notes}</div>
                      )}
                    </>
                  ) : (
                    String(competitor)
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Wyzwania */}
      {submission.challenges && submission.challenges.length > 0 && (
        <div>
          <h3 className="text-lg font-medium">Wyzwania</h3>
          <div className="mt-2">
            <ul className="list-disc pl-5">
              {submission.challenges.map((challenge: any, index: number) => (
                <li key={`challenge-${index}`} className="text-sm">
                  {typeof challenge === 'object' && challenge !== null
                    ? String(Object.values(challenge)[0] || '')
                    : String(challenge)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponent wyświetlający szczegóły formularza strony dla klienta
function ClientFormSubmissionDetails({ submission }: { submission: any }): React.JSX.Element {
  // Bezpieczne renderowanie wartości
  const renderValue = (value: any, defaultValue: string = "Nie określono") => {
    if (value === undefined || value === null || value === "") return defaultValue;
    if (typeof value === "object") {
      // If it's a URL object, return the url property
      if (value.url) return value.url;
      // For other objects, try to convert to string or return default
      try {
        const str = JSON.stringify(value);
        return str === '{}' ? defaultValue : str;
      } catch {
        return defaultValue;
      }
    }
    return String(value);
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
  
  // Funkcja do określania kontrastu tekstu na podstawie koloru tła
  const getContrastText = (hexColor: string) => {
    // Domyślny kolor tekstu, jeśli kolor tła jest nieprawidłowy
    if (!hexColor || hexColor === '#cccccc') return 'text-gray-800';
    
    // Konwertuj hex na RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Oblicz jasność (wg. YIQ formula)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Zwróć odpowiednią klasę koloru tekstu
    return yiq >= 128 ? 'text-gray-800' : 'text-white';
  };
  
  return (
    <div className="space-y-6 p-4">
      {/* Dane podstawowe - na pełną szerokość */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-primary mb-3">Dane podstawowe</h3>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Nazwa:</span> 
            <span className="text-sm ml-2">{renderValue(submission.name)}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Email:</span> 
            <span className="text-sm ml-2">{renderValue(submission.email)}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Data utworzenia:</span>
            <span className="text-sm ml-2">{formatDateValue(submission.createdAt)}</span>
          </div>
          {submission.updatedAt && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Data aktualizacji:</span>
              <span className="text-sm ml-2">{formatDateValue(submission.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Opis */}
          {submission.description && (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-primary mb-3">Opis projektu</h3>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.description)}</p>
              </div>
            </div>
          )}
          
          {/* Ustawienia strony */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-primary mb-3">Ustawienia strony</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Styl strony:</span> 
                <span className="text-sm ml-2 block">{renderValue(submission.websiteStyle)}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Typ treści:</span> 
                <span className="text-sm ml-2 block">{renderValue(submission.contentType)}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Schemat kolorów:</span> 
                <span className="text-sm ml-2 block">{renderValue(submission.colorScheme)}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Typ zdjęć:</span> 
                <span className="text-sm ml-2 block">{renderValue(submission.photoType)}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Opcja domeny:</span> 
                <span className="text-sm ml-2 block">{renderValue(submission.domainOption)}</span>
              </div>
              {submission.domainOption === 'own' && (
                <div>
                  <span className="text-sm font-medium">Własna domena:</span> 
                  <span className="text-sm ml-2 block">{renderValue(submission.ownDomain)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Wybrane sekcje */}
          {submission.selectedSections?.length > 0 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-primary mb-3">Wybrane sekcje</h3>
              <div className="flex flex-wrap gap-1.5">
                {submission.selectedSections.map((section: any, index: number) => (
                  <div key={`section-${index}`} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                    {section}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Niestandardowe kolory */}
          {submission.customColors && (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium text-primary mb-3">Niestandardowe kolory</h3>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Podstawowy</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{submission.customColors.primary || '#cccccc'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-full h-12 rounded-md border border-gray-200 relative"
                      style={{ backgroundColor: submission.customColors.primary || '#cccccc' }}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center ${getContrastText(submission.customColors.primary)}`}>
                        <span className="text-xs font-medium">Podstawowy</span>
                      </div>
                      <button 
                        className="absolute bottom-1 right-1 bg-white text-xs px-1.5 py-0.5 rounded shadow-sm opacity-80 hover:opacity-100"
                        onClick={() => {
                          navigator.clipboard.writeText(submission.customColors.primary || '#cccccc');
                          toast.success("Kolor skopiowany do schowka");
                        }}
                      >
                        Kopiuj
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Drugorzędny</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{submission.customColors.secondary || '#cccccc'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-full h-12 rounded-md border border-gray-200 relative"
                      style={{ backgroundColor: submission.customColors.secondary || '#cccccc' }}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center ${getContrastText(submission.customColors.secondary)}`}>
                        <span className="text-xs font-medium">Drugorzędny</span>
                      </div>
                      <button 
                        className="absolute bottom-1 right-1 bg-white text-xs px-1.5 py-0.5 rounded shadow-sm opacity-80 hover:opacity-100"
                        onClick={() => {
                          navigator.clipboard.writeText(submission.customColors.secondary || '#cccccc');
                          toast.success("Kolor skopiowany do schowka");
                        }}
                      >
                        Kopiuj
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Akcentowy</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{submission.customColors.accent || '#cccccc'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-full h-12 rounded-md border border-gray-200 relative"
                      style={{ backgroundColor: submission.customColors.accent || '#cccccc' }}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center ${getContrastText(submission.customColors.accent)}`}>
                        <span className="text-xs font-medium">Akcentowy</span>
                      </div>
                      <button 
                        className="absolute bottom-1 right-1 bg-white text-xs px-1.5 py-0.5 rounded shadow-sm opacity-80 hover:opacity-100"
                        onClick={() => {
                          navigator.clipboard.writeText(submission.customColors.accent || '#cccccc');
                          toast.success("Kolor skopiowany do schowka");
                        }}
                      >
                        Kopiuj
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-muted-foreground mb-2">Podgląd palety kolorów:</div>
                  <div className="flex h-20 rounded-md overflow-hidden">
                    <div className="flex-1" style={{ backgroundColor: submission.customColors.primary || '#cccccc' }}></div>
                    <div className="flex-1" style={{ backgroundColor: submission.customColors.secondary || '#cccccc' }}></div>
                    <div className="flex-1" style={{ backgroundColor: submission.customColors.accent || '#cccccc' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Niestandardowe sekcje */}
      {submission.customSections?.length > 0 && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-primary mb-3">Niestandardowe sekcje</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {submission.customSections.map((section: any, index: number) => (
              <div key={`custom-section-${index}`} className="border rounded-md p-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold">{renderValue(section.name, `Sekcja ${index + 1}`)}</h4>
                  {section.price > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">{section.price} PLN</span>
                  )}
                </div>
                {section.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}