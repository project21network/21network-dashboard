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
import { SeoSubmission } from "@/lib/types/seo-submission";
import { FormSubmission, CustomColor, CustomSection } from "@/lib/types/form-submission";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
                              <span className="font-medium">Styl strony:</span> {submission.websiteStyle || "Nie określono"}
                            </div>
                            <div>
                              <span className="font-medium">Sekcje:</span> {submission.selectedSections?.slice(0, 2).join(", ")}
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
                          <span className="font-medium">Styl strony:</span> {submission.websiteStyle || "Nie określono"}
                        </div>
                        <div>
                          <span className="font-medium">Sekcje:</span> {submission.selectedSections?.slice(0, 2).join(", ")}
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
function ClientSeoSubmissionDetails({ submission }: { submission: SeoSubmission }) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Dane podstawowe</h3>
            <div className="mt-1 space-y-1 text-sm">
              <div>
                <span className="font-medium">URL strony:</span> {renderValue(submission.websiteUrl)}
              </div>
              <div>
                <span className="font-medium">Data utworzenia:</span>{" "}
                {formatDateValue(submission.createdAt)}
              </div>
              <div>
                <span className="font-medium">Budżet:</span> {getBudgetLabel(submission.budget, submission.customBudget)}
              </div>
              <div>
                <span className="font-medium">Ramy czasowe:</span> {getTimeframeLabel(submission.targetTimeframe)}
              </div>
            </div>
          </div>
          
          {/* Opis */}
          {submission.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Opis projektu</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.description)}</p>
              </div>
            </div>
          )}
          
          {/* Oczekiwania */}
          {submission.expectations && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Oczekiwania</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.expectations)}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Wybrane usługi */}
          {submission.selectedServices.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Wybrane usługi SEO</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {submission.selectedServices.map((service, index) => (
                  <div key={`service-${index}`} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                    {service}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Wybrane słowa kluczowe */}
          {submission.selectedKeywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Wybrane słowa kluczowe</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {submission.selectedKeywords.map((keyword, index) => (
                  <div key={`keyword-${index}`} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Konkurenci */}
          {submission.competitors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Konkurenci</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {submission.competitors.map((competitor, index) => (
                    <li key={`competitor-${index}`}>{competitor}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Wyzwania */}
          {submission.challenges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Wyzwania</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {submission.challenges.map((challenge, index) => (
                    <li key={`challenge-${index}`}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Cele SEO */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Cele SEO</h3>
        <div className="mt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {submission.goals.traffic.length > 0 && (
            <div className="border rounded-md p-2">
              <h4 className="text-xs font-semibold mb-1">Cele ruchu</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                {submission.goals.traffic.map((goal, index) => (
                  <li key={`traffic-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
          
          {submission.goals.conversion.length > 0 && (
            <div className="border rounded-md p-2">
              <h4 className="text-xs font-semibold mb-1">Cele konwersji</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                {submission.goals.conversion.map((goal, index) => (
                  <li key={`conversion-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
          
          {submission.goals.positions.length > 0 && (
            <div className="border rounded-md p-2">
              <h4 className="text-xs font-semibold mb-1">Cele pozycji</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                {submission.goals.positions.map((goal, index) => (
                  <li key={`position-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
          
          {submission.goals.custom.length > 0 && (
            <div className="border rounded-md p-2">
              <h4 className="text-xs font-semibold mb-1">Cele niestandardowe</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                {submission.goals.custom.map((goal, index) => (
                  <li key={`custom-${index}`}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponent wyświetlający szczegóły formularza strony dla klienta
function ClientFormSubmissionDetails({ submission }: { submission: FormSubmission }) {
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
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Dane podstawowe</h3>
            <div className="mt-1 space-y-1 text-sm">
              <div>
                <span className="font-medium">Nazwa:</span> {renderValue(submission.name)}
              </div>
              <div>
                <span className="font-medium">Email:</span> {renderValue(submission.email)}
              </div>
              <div>
                <span className="font-medium">Data utworzenia:</span>{" "}
                {formatDateValue(submission.createdAt)}
              </div>
            </div>
          </div>
          
          {/* Opis */}
          {submission.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Opis projektu</h3>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{renderValue(submission.description)}</p>
              </div>
            </div>
          )}
          
          {/* Ustawienia strony */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Ustawienia strony</h3>
            <div className="mt-1 space-y-1 text-sm">
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
              <div className="mt-1 flex flex-wrap gap-1.5">
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
              <div className="mt-1 grid grid-cols-3 gap-2">
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
          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            {submission.customSections.map((section, index) => (
              <div key={`custom-section-${index}`} className="border rounded-md p-2">
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