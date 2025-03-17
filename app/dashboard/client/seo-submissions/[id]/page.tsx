"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SeoSubmission, SeoKeyword, SeoGoals, SeoHistory } from "@/lib/types/seo-submission";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Dodatkowe interfejsy dla typów obiektów
interface Competitor {
  url: string;
  notes?: string;
  id?: string;
}

interface CustomGoal {
  description: string;
  id?: string;
}

interface CustomService {
  id?: string;
  name: string;
  description?: string;
}

// Funkcje pomocnicze do mapowania statusu na kolory i tekst
function getStatusColor(status: string) {
  const statusColors: Record<string, string> = {
    new: "bg-blue-500",
    processing: "bg-yellow-500",
    "in-progress": "bg-yellow-500",
    completed: "bg-green-500",
    rejected: "bg-red-500",
    cancelled: "bg-red-500",
  };
  return statusColors[status] || "bg-gray-500";
}

function getStatusText(status: string) {
  const statusTexts: Record<string, string> = {
    new: "Nowy",
    processing: "W trakcie",
    "in-progress": "W trakcie",
    completed: "Zakończony",
    rejected: "Odrzucony",
    cancelled: "Anulowany",
  };
  return statusTexts[status] || "Nieznany";
}

// Mapowanie budżetu i ram czasowych na etykiety
const budgetLabels: Record<string, string> = {
  "low": "Niski",
  "medium": "Średni",
  "high": "Wysoki",
  "enterprise": "Enterprise",
  "1000-3000": "1000-3000 PLN",
  "3000-5000": "3000-5000 PLN",
  "5000-10000": "5000-10000 PLN",
  "10000+": "Powyżej 10000 PLN",
  "custom": "Własny budżet",
};

const timeframeLabels: Record<string, string> = {
  "short": "Krótki termin (1-3 miesiące)",
  "medium": "Średni termin (3-6 miesięcy)",
  "long": "Długi termin (6+ miesięcy)",
  "1-3": "1-3 miesiące",
  "3-6": "3-6 miesięcy",
  "6-12": "6-12 miesięcy",
  "12+": "Powyżej 12 miesięcy",
};

export default function ClientSeoSubmissionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<SeoSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        setLoading(true);
        setError(null);
        
        const docRef = doc(db, "seoFormSubmissions", id as string);
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
        
        // Bezpieczne konwersje tablic
        const selectedServices = Array.isArray(data.selectedServices) ? data.selectedServices : [];
        const customServices = Array.isArray(data.customServices) ? data.customServices : [];
        const selectedKeywords = Array.isArray(data.selectedKeywords) ? data.selectedKeywords : [];
        const customKeywords = Array.isArray(data.customKeywords) ? data.customKeywords : [];
        const competitors = Array.isArray(data.competitors) ? data.competitors : [];
        const challenges = Array.isArray(data.challenges) ? data.challenges : [];
        
        // Przygotowanie struktury dla SeoGoals
        const goals: SeoGoals = {
          traffic: Array.isArray(data.goals?.traffic) ? data.goals.traffic : [],
          conversion: Array.isArray(data.goals?.conversion) ? data.goals.conversion : [],
          positions: Array.isArray(data.goals?.positions) ? data.goals.positions : [],
          custom: Array.isArray(data.goals?.custom) ? data.goals.custom : []
        };
        
        // Przygotowanie struktury dla SeoHistory
        const seoHistory: SeoHistory = {
          previouslyWorked: data.seoHistory?.previouslyWorked || false,
          startDate: data.seoHistory?.startDate || '',
          endDate: data.seoHistory?.endDate || '',
          previousAgencies: Array.isArray(data.seoHistory?.previousAgencies) ? data.seoHistory.previousAgencies : [],
          previousResults: data.seoHistory?.previousResults || ''
        };
        
        // Tworzenie obiektu submission z bezpiecznymi wartościami domyślnymi
        const formattedSubmission: SeoSubmission = {
          id: docSnap.id,
          name: data.name || '',
          email: data.email || '',
          websiteUrl: data.websiteUrl || '',
          createdAt,
          budget: data.budget || '',
          customBudget: data.customBudget || '',
          targetTimeframe: data.targetTimeframe || '',
          description: data.description || '',
          expectations: data.expectations || '',
          selectedServices,
          customServices,
          selectedKeywords,
          customKeywords,
          competitors,
          challenges,
          goals,
          seoHistory,
          otherInfo: data.otherInfo || '',
          additionalInfo: typeof data.additionalInfo === 'object' && data.additionalInfo !== null 
            ? data.additionalInfo 
            : { text: typeof data.additionalInfo === 'string' ? data.additionalInfo : '' },
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
        <h1 className="text-2xl font-bold">Szczegóły zgłoszenia SEO</h1>
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
            <h3 className="font-medium">Adres strony</h3>
            <p>
              <a
                href={submission.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {submission.websiteUrl}
              </a>
            </p>
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
            <h3 className="font-medium">Budżet</h3>
            <p>
              {submission.budget === "custom"
                ? submission.customBudget
                : budgetLabels[submission.budget] || submission.budget}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Ramy czasowe</h3>
            <p>{timeframeLabels[submission.targetTimeframe] || submission.targetTimeframe}</p>
          </div>
          <div>
            <h3 className="font-medium">Opis projektu</h3>
            <p className="whitespace-pre-line">{submission.description}</p>
          </div>
          <div>
            <h3 className="font-medium">Oczekiwania</h3>
            <p className="whitespace-pre-line">{submission.expectations}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usługi i słowa kluczowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Wybrane usługi</h3>
            {submission.selectedServices.length > 0 ? (
              <ul className="list-disc pl-5">
                {submission.selectedServices.map((service: string, index: number) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            ) : (
              <p>Brak wybranych usług</p>
            )}
          </div>

          {submission.customServices.length > 0 && (
            <div>
              <h3 className="font-medium">Dodatkowe usługi</h3>
              <ul className="list-disc pl-5">
                {submission.customServices.map((service, index) => {
                  if (typeof service === 'object' && service !== null && 'name' in service) {
                    const customService = service as CustomService;
                    return (
                      <li key={index}>
                        {customService.name}
                        {customService.description && (
                          <div className="text-sm text-gray-500">{customService.description}</div>
                        )}
                      </li>
                    );
                  }
                  return <li key={index}>{String(service)}</li>;
                })}
              </ul>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-medium">Wybrane słowa kluczowe</h3>
            {submission.selectedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {submission.selectedKeywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            ) : (
              <p>Brak wybranych słów kluczowych</p>
            )}
          </div>

          {submission.customKeywords.length > 0 && (
            <div>
              <h3 className="font-medium">Dodatkowe słowa kluczowe</h3>
              <div className="flex flex-wrap gap-2">
                {submission.customKeywords.map((keyword, index) => {
                  if (typeof keyword === 'object' && keyword !== null && 'name' in keyword) {
                    return (
                      <Badge key={index} variant="outline">
                        {keyword.name}
                        {keyword.description && (
                          <span className="ml-1 text-gray-500">- {keyword.description}</span>
                        )}
                      </Badge>
                    );
                  }
                  return (
                    <Badge key={index} variant="outline">
                      {String(keyword)}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konkurencja i cele</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Konkurenci</h3>
            {submission.competitors.length > 0 ? (
              <ul className="list-disc pl-5">
                {submission.competitors.map((competitor, index) => {
                  if (typeof competitor === 'object' && competitor !== null && 'url' in competitor) {
                    const comp = competitor as Competitor;
                    return (
                      <li key={index}>
                        <div>{comp.url}</div>
                        {comp.notes && (
                          <div className="text-sm text-gray-500">{comp.notes}</div>
                        )}
                      </li>
                    );
                  }
                  return <li key={index}>{String(competitor)}</li>;
                })}
              </ul>
            ) : (
              <p>Brak podanych konkurentów</p>
            )}
          </div>

          <div>
            <h3 className="font-medium">Wyzwania</h3>
            {submission.challenges.length > 0 ? (
              <ul className="list-disc pl-5">
                {submission.challenges.map((challenge, index) => {
                  if (typeof challenge === 'object' && challenge !== null) {
                    // Jeśli to obiekt, próbujemy wyciągnąć wartość
                    const value = Object.values(challenge)[0];
                    return <li key={index}>{String(value || '')}</li>;
                  }
                  return <li key={index}>{String(challenge)}</li>;
                })}
              </ul>
            ) : (
              <p>Brak podanych wyzwań</p>
            )}
          </div>

          <div>
            <h3 className="font-medium">Cele</h3>
            <div className="space-y-2">
              {submission.goals.traffic.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Cele ruchu:</h4>
                  <ul className="list-disc pl-5">
                    {submission.goals.traffic.map((goal: string, index: number) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {submission.goals.conversion.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Cele konwersji:</h4>
                  <ul className="list-disc pl-5">
                    {submission.goals.conversion.map((goal: string, index: number) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {submission.goals.positions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Cele pozycji:</h4>
                  <ul className="list-disc pl-5">
                    {submission.goals.positions.map((goal: string, index: number) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {submission.goals.custom.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Cele niestandardowe:</h4>
                  <ul className="list-disc pl-5">
                    {submission.goals.custom.map((goal, index) => {
                      if (typeof goal === 'object' && goal !== null && 'description' in goal) {
                        const customGoal = goal as CustomGoal;
                        return <li key={index}>{customGoal.description}</li>;
                      }
                      return <li key={index}>{String(goal)}</li>;
                    })}
                  </ul>
                </div>
              )}
              
              {submission.goals.traffic.length === 0 && 
               submission.goals.conversion.length === 0 && 
               submission.goals.positions.length === 0 && 
               submission.goals.custom.length === 0 && (
                <p>Brak podanych celów</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historia SEO i dodatkowe informacje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Historia działań SEO</h3>
            {submission.seoHistory.previouslyWorked ? (
              <div className="space-y-2">
                <p>Okres współpracy: {submission.seoHistory.startDate} - {submission.seoHistory.endDate}</p>
                
                {submission.seoHistory.previousAgencies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium">Poprzednie agencje:</h4>
                    <ul className="list-disc pl-5">
                      {submission.seoHistory.previousAgencies.map((agency: string, index: number) => (
                        <li key={index}>{agency}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {submission.seoHistory.previousResults && (
                  <div>
                    <h4 className="text-sm font-medium">Poprzednie wyniki:</h4>
                    <p className="whitespace-pre-line">{submission.seoHistory.previousResults}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>Brak historii działań SEO</p>
            )}
          </div>

          <div>
            <h3 className="font-medium">Dodatkowe informacje</h3>
            <div className="whitespace-pre-line">
              {typeof submission.additionalInfo === 'object' && submission.additionalInfo !== null ? (
                <>
                  {submission.additionalInfo.text && (
                    <p>{submission.additionalInfo.text}</p>
                  )}
                  
                  {submission.additionalInfo.challenges && Array.isArray(submission.additionalInfo.challenges) && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">Wyzwania:</h4>
                      <ul className="list-disc pl-5">
                        {submission.additionalInfo.challenges.map((challenge, index) => {
                          if (typeof challenge === 'object' && challenge !== null) {
                            const value = Object.values(challenge)[0];
                            return <li key={index}>{String(value || '')}</li>;
                          }
                          return <li key={index}>{String(challenge)}</li>;
                        })}
                      </ul>
                    </div>
                  )}
                  
                  {submission.additionalInfo.expectations && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">Oczekiwania:</h4>
                      <p>{String(submission.additionalInfo.expectations)}</p>
                    </div>
                  )}
                  
                  {submission.additionalInfo.otherInfo && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">Inne informacje:</h4>
                      <p>{String(submission.additionalInfo.otherInfo)}</p>
                    </div>
                  )}
                  
                  {!submission.additionalInfo.text && 
                   !submission.additionalInfo.challenges && 
                   !submission.additionalInfo.expectations && 
                   !submission.additionalInfo.otherInfo && (
                    <p>{JSON.stringify(submission.additionalInfo)}</p>
                  )}
                </>
              ) : (
                <p>{String(submission.additionalInfo || '')}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium">Inne uwagi</h3>
            <p className="whitespace-pre-line">{submission.otherInfo || "Brak"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 