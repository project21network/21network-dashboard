import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormSubmission } from "@/lib/types/form-submission";
import { SeoSubmission, SeoKeyword } from "@/lib/types/seo-submission";

interface SeoSubmissionDetailsProps {
  submission: SeoSubmission;
}

export function SeoSubmissionDetails({ submission }: SeoSubmissionDetailsProps) {
  // Bezpieczne renderowanie wartości
  const renderValue = (value: string | undefined, fallback: string = "Nie podano") => {
    return value && value.trim() !== "" ? value : fallback;
  };

  const formatDateValue = (date: Date | undefined) => {
    return date ? format(date, "dd MMMM yyyy, HH:mm", { locale: pl }) : "Nie podano";
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success("Kolor skopiowany do schowka");
  };

  return (
    <div className="space-y-6">
      {/* Dane podstawowe */}
      <Card>
        <CardHeader>
          <CardTitle>Dane podstawowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Nazwa:</span> {renderValue(submission.name)}
          </div>
          <div>
            <span className="font-medium">Email:</span> {renderValue(submission.email)}
          </div>
          <div>
            <span className="font-medium">Strona WWW:</span> {renderValue(submission.websiteUrl)}
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
          <div>
            <span className="font-medium">Status:</span>{" "}
            <Badge variant="outline" className="ml-2">
              {submission.status === "new" ? "Nowy" : 
               submission.status === "processing" ? "W trakcie" : 
               submission.status === "completed" ? "Zakończony" : 
               submission.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Opis projektu */}
      {submission.description && (
        <Card>
          <CardHeader>
            <CardTitle>Opis projektu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{renderValue(submission.description)}</p>
          </CardContent>
        </Card>
      )}

      {/* Budżet */}
      <Card>
        <CardHeader>
          <CardTitle>Budżet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Preferowany budżet:</span>{" "}
            {submission.budget === 'custom' ? submission.customBudget : submission.budget}
          </div>
          <div>
            <span className="font-medium">Oczekiwany czas realizacji:</span>{" "}
            {renderValue(submission.targetTimeframe)}
          </div>
        </CardContent>
      </Card>

      {/* Cele */}
      <Card>
        <CardHeader>
          <CardTitle>Cele SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submission.goals.traffic.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Cele ruchu:</h4>
              <div className="flex flex-wrap gap-2">
                {submission.goals.traffic.map((goal, index) => (
                  <Badge key={index} variant="outline">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {submission.goals.conversion.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Cele konwersji:</h4>
              <div className="flex flex-wrap gap-2">
                {submission.goals.conversion.map((goal, index) => (
                  <Badge key={index} variant="outline">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {submission.goals.positions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Cele pozycji:</h4>
              <div className="flex flex-wrap gap-2">
                {submission.goals.positions.map((goal, index) => (
                  <Badge key={index} variant="outline">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {submission.goals.custom.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Cele niestandardowe:</h4>
              <div className="flex flex-wrap gap-2">
                {submission.goals.custom.map((goal, index) => (
                  <Badge key={index} variant="outline">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wybrane usługi */}
      {submission.selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wybrane usługi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {submission.selectedServices.map((service, index) => (
                <Badge key={index} variant="outline">
                  {service}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Słowa kluczowe */}
      {(submission.selectedKeywords.length > 0 || submission.customKeywords.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Słowa kluczowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.selectedKeywords.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Wybrane słowa kluczowe:</h4>
                <div className="flex flex-wrap gap-2">
                  {submission.selectedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {submission.customKeywords.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Własne słowa kluczowe:</h4>
                <div className="space-y-2">
                  {submission.customKeywords.map((keyword: SeoKeyword, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-md">
                      <p className="font-medium">{keyword.name}</p>
                      {keyword.description && (
                        <p className="text-sm text-muted-foreground mt-1">{keyword.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Konkurencja */}
      {submission.competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Konkurencja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {submission.competitors.map((competitor, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>•</span>
                  <a 
                    href={competitor} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {competitor}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wyzwania */}
      {submission.challenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wyzwania</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {submission.challenges.map((challenge, index) => (
                <Badge key={index} variant="outline">
                  {challenge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historia SEO */}
      {submission.seoHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Historia SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Wcześniejsza współpraca z agencjami SEO:</span>{" "}
              {submission.seoHistory.previouslyWorked ? "Tak" : "Nie"}
            </div>
            {submission.seoHistory.previouslyWorked && (
              <>
                {submission.seoHistory.startDate && (
                  <div>
                    <span className="font-medium">Data rozpoczęcia:</span>{" "}
                    {renderValue(submission.seoHistory.startDate)}
                  </div>
                )}
                {submission.seoHistory.endDate && (
                  <div>
                    <span className="font-medium">Data zakończenia:</span>{" "}
                    {renderValue(submission.seoHistory.endDate)}
                  </div>
                )}
                {submission.seoHistory.previousAgencies.length > 0 && (
                  <div>
                    <span className="font-medium">Poprzednie agencje:</span>
                    <div className="mt-1 space-y-1">
                      {submission.seoHistory.previousAgencies.map((agency, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {agency}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {submission.seoHistory.previousResults && (
                  <div>
                    <span className="font-medium">Poprzednie wyniki:</span>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                      {submission.seoHistory.previousResults}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dodatkowe informacje */}
      {submission.otherInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Dodatkowe informacje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{renderValue(submission.otherInfo)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 