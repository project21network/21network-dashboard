"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FormSubmission, CustomColor, CustomSection } from "@/lib/types/form-submission";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Funkcje pomocnicze do mapowania statusu na kolory i tekst
function getStatusColor(status: string) {
  const statusColors: Record<string, string> = {
    new: "bg-blue-500",
    "in-progress": "bg-yellow-500",
    completed: "bg-green-500",
    rejected: "bg-red-500",
  };
  return statusColors[status] || "bg-gray-500";
}

function getStatusText(status: string) {
  const statusTexts: Record<string, string> = {
    new: "Nowy",
    "in-progress": "W trakcie",
    completed: "Zakończony",
    rejected: "Odrzucony",
  };
  return statusTexts[status] || "Nieznany";
}

// Mapowanie budżetu i ram czasowych na etykiety
const budgetLabels: Record<string, string> = {
  "1000-3000": "1000-3000 PLN",
  "3000-5000": "3000-5000 PLN",
  "5000-10000": "5000-10000 PLN",
  "10000+": "Powyżej 10000 PLN",
  custom: "Własny budżet",
};

const timeframeLabels: Record<string, string> = {
  "1-3": "1-3 miesiące",
  "3-6": "3-6 miesięcy",
  "6-12": "6-12 miesięcy",
  "12+": "Powyżej 12 miesięcy",
};

export default function ClientFormSubmissionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        setLoading(true);
        setError(null);
        
        const docRef = doc(db, "formSubmissions", id as string);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError("Nie znaleziono zgłoszenia");
          setLoading(false);
          return;
        }
        
        const data = docSnap.data();
        
        // Bezpieczne konwersje dat
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date();
        
        // Bezpieczne konwersje tablic i obiektów
        const selectedSections = Array.isArray(data.selectedSections) ? data.selectedSections : [];
        const customSections = Array.isArray(data.customSections) ? data.customSections : [];
        const customColors: CustomColor = {
          primary: data.customColors?.primary || '',
          secondary: data.customColors?.secondary || '',
          accent: data.customColors?.accent || ''
        };
        
        // Tworzenie obiektu submission z bezpiecznymi wartościami domyślnymi
        const formattedSubmission: FormSubmission = {
          id: docSnap.id,
          name: data.name || '',
          email: data.email || '',
          websiteStyle: data.websiteStyle || '',
          colorScheme: data.colorScheme || '',
          photoType: data.photoType || '',
          domainOption: data.domainOption || '',
          ownDomain: data.ownDomain || '',
          contentType: data.contentType || '',
          description: data.description || '',
          customColors,
          selectedSections,
          customSections,
          createdAt,
          status: data.status || 'new',
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
        };
        
        setSubmission(formattedSubmission);
      } catch (err) {
        console.error("Błąd podczas pobierania zgłoszenia:", err);
        setError("Wystąpił błąd podczas pobierania danych zgłoszenia");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchSubmission();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Błąd</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!submission) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nie znaleziono</AlertTitle>
        <AlertDescription>Nie znaleziono zgłoszenia o podanym ID</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Szczegóły zgłoszenia</h1>
        <Badge className={getStatusColor(submission.status)}>
          {getStatusText(submission.status)}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacje podstawowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Imię i nazwisko</h3>
            <p>{submission.name}</p>
          </div>
          <div>
            <h3 className="font-medium">Email</h3>
            <p>{submission.email}</p>
          </div>
          <div>
            <h3 className="font-medium">Data zgłoszenia</h3>
            <p>
              {submission.createdAt.toLocaleDateString("pl-PL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Szczegóły projektu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Styl strony</h3>
            <p>{submission.websiteStyle || "Nie określono"}</p>
          </div>
          <div>
            <h3 className="font-medium">Schemat kolorów</h3>
            <p>{submission.colorScheme || "Nie określono"}</p>
          </div>
          <div>
            <h3 className="font-medium">Typ zdjęć</h3>
            <p>{submission.photoType || "Nie określono"}</p>
          </div>
          <div>
            <h3 className="font-medium">Opcja domeny</h3>
            <p>{submission.domainOption || "Nie określono"}</p>
          </div>
          {submission.domainOption === 'own' && (
            <div>
              <h3 className="font-medium">Własna domena</h3>
              <p>{submission.ownDomain || "Nie określono"}</p>
            </div>
          )}
          <div>
            <h3 className="font-medium">Typ treści</h3>
            <p>{submission.contentType || "Nie określono"}</p>
          </div>
          {submission.description && (
            <div>
              <h3 className="font-medium">Opis projektu</h3>
              <p className="whitespace-pre-line">{submission.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {submission.selectedSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wybrane sekcje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {submission.selectedSections.map((section: string, index: number) => (
                <Badge key={index} variant="outline">
                  {section}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {submission.customSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Niestandardowe sekcje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.customSections.map((section: CustomSection, index: number) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{section.name || `Sekcja ${index + 1}`}</h4>
                    {section.price > 0 && (
                      <Badge variant="outline">{section.price} PLN</Badge>
                    )}
                  </div>
                  {section.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 