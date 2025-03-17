"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { useSeoSubmissions } from "@/lib/hooks/use-seo-submissions";
import { SeoSubmission } from "@/lib/types/seo-submission";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

// Dodatkowe interfejsy dla typów obiektów
interface Competitor {
  url: string;
  notes?: string;
  id?: string;
}

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
  const { submissions, isLoading, error } = useSeoSubmissions();
  const router = useRouter();
  
  // Funkcja otwierająca stronę ze szczegółami
  const handleOpenDetails = (id: string) => {
    router.push(`/dashboard/admin/seo-submissions/${id}`);
  };

  // Funkcja aktualizująca status ankiety
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSeoSubmissionStatus(id, newStatus);
      toast.success(`Status ankiety został zaktualizowany na "${getStatusText(newStatus)}"`);
    } catch (error) {
      console.error("Error updating submission status:", error);
      toast.error("Wystąpił błąd podczas aktualizacji statusu ankiety");
    }
  };

  useEffect(() => {
    // Ten efekt będzie wywoływany przy inicjalizacji
  }, []);

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
                        {submission.competitors?.slice(0, 2).map((competitor: any, index: number) => (
                          <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {typeof competitor === 'object' && competitor !== null && 'url' in competitor
                              ? competitor.url
                              : String(competitor)}
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
                          <DropdownMenuContent className="bg-white shadow-lg border border-gray-200" align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(submission.id, "new")} className="hover:bg-gray-50">
                              <AlertCircle className="mr-2 h-4 w-4" /> Oznacz jako "Nowe"
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(submission.id, "processing")} className="hover:bg-gray-50">
                              <Clock className="mr-2 h-4 w-4" /> Oznacz jako "W trakcie"
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(submission.id, "completed")} className="hover:bg-gray-50">
                              <CheckCircle className="mr-2 h-4 w-4" /> Oznacz jako "Zakończone"
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
    </div>
  );
} 