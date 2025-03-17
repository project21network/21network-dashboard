import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormSubmission } from "@/lib/types/form-submission";

interface FormSubmissionDetailsProps {
  submission: FormSubmission;
}

export function FormSubmissionDetails({ submission }: FormSubmissionDetailsProps) {
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

      {/* Ustawienia strony */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia strony</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Styl strony:</span>{" "}
            {renderValue(submission.websiteStyle)}
          </div>
          <div>
            <span className="font-medium">Schemat kolorów:</span>{" "}
            {renderValue(submission.colorScheme)}
          </div>
          <div>
            <span className="font-medium">Typ zdjęć:</span>{" "}
            {renderValue(submission.photoType)}
          </div>
          <div>
            <span className="font-medium">Opcja domeny:</span>{" "}
            {renderValue(submission.domainOption)}
          </div>
          {submission.ownDomain && (
            <div>
              <span className="font-medium">Własna domena:</span>{" "}
              {renderValue(submission.ownDomain)}
            </div>
          )}
          <div>
            <span className="font-medium">Typ treści:</span>{" "}
            {renderValue(submission.contentType)}
          </div>
        </CardContent>
      </Card>

      {/* Wybrane sekcje */}
      {submission.selectedSections && submission.selectedSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wybrane sekcje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {submission.selectedSections.map((section, index) => (
                <Badge key={index} variant="outline">
                  {section}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Niestandardowe sekcje */}
      {submission.customSections && submission.customSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Niestandardowe sekcje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {submission.customSections.map((section, index) => (
                <div key={index} className="border rounded-md p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">
                      {renderValue(section.name, `Sekcja ${index + 1}`)}
                    </h4>
                    {section.price && section.price > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                        {section.price} PLN
                      </span>
                    )}
                  </div>
                  {section.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Niestandardowe kolory */}
      {submission.customColors && (
        <Card>
          <CardHeader>
            <CardTitle>Niestandardowe kolory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(submission.customColors).map(([key, color]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{key}:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyColor(color)}
                    >
                      Kopiuj
                    </Button>
                  </div>
                  <div className="h-10 rounded-md border" style={{ backgroundColor: color }} />
                  <p className="text-sm text-muted-foreground text-center">{color}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 