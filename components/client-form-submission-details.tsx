import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { FormSubmission } from "@/lib/types/form-submission";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface Props {
  submission: FormSubmission;
}

export function ClientFormSubmissionDetails({ submission }: Props): React.JSX.Element {
  // Bezpieczne renderowanie wartości
  function renderValue(value: any): React.ReactNode {
    if (value === undefined || value === null || value === '') {
      return <span className="text-muted-foreground">Nie podano</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">Nie podano</span>;
      }
      
      return value.map((item, index) => (
        <span key={index} className="mr-2">
          {renderValue(item)}
          {index < value.length - 1 ? ', ' : ''}
        </span>
      ));
    }
    
    if (typeof value === 'object') {
      const values = Object.values(value);
      if (values.length > 0 && values[0] !== null && values[0] !== undefined) {
        return String(values[0]);
      }
      
      return <span className="text-muted-foreground">Złożony obiekt</span>;
    }
    
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

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Dane podstawowe */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Dane podstawowe</h3>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Nazwa:</span>{' '}
            {renderValue(submission.name)}
          </div>
          <div>
            <span className="font-medium">Email:</span>{' '}
            {renderValue(submission.email)}
          </div>
          <div>
            <span className="font-medium">Data utworzenia:</span>{' '}
            {submission.createdAt && formatDateValue(submission.createdAt)}
          </div>
          {submission.updatedAt && (
            <div>
              <span className="font-medium">Data aktualizacji:</span>{' '}
              {formatDateValue(submission.updatedAt)}
            </div>
          )}
        </div>
      </div>

      {/* Opis projektu */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Opis projektu</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {renderValue(submission.description)}
        </div>
      </div>

      {/* Wybrane sekcje */}
      {submission.selectedSections && submission.selectedSections.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Wybrane sekcje</h3>
          <div className="flex flex-wrap gap-2">
            {submission.selectedSections.map((section: string, index: number) => (
              <span
                key={index}
                className="bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium"
              >
                {renderValue(section)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ustawienia strony */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Ustawienia strony</h3>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Styl strony:</span>{' '}
            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
              {renderValue(submission.websiteStyle)}
            </span>
          </div>
          <div>
            <span className="font-medium">Typ treści:</span>{' '}
            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
              {renderValue(submission.contentType)}
            </span>
          </div>
          <div>
            <span className="font-medium">Schemat kolorów:</span>{' '}
            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
              {renderValue(submission.colorScheme)}
            </span>
          </div>
          <div>
            <span className="font-medium">Typ zdjęć:</span>{' '}
            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
              {renderValue(submission.photoType)}
            </span>
          </div>
          <div>
            <span className="font-medium">Opcja domeny:</span>{' '}
            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
              {renderValue(submission.domainOption)}
            </span>
          </div>
          {submission.ownDomain && (
            <div>
              <span className="font-medium">Własna domena:</span>{' '}
              <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                {renderValue(submission.ownDomain)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Niestandardowe kolory */}
      {submission.customColors && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Niestandardowe kolory</h3>
          <div className="space-y-4">
            {submission.customColors.primary && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-md shadow-sm border border-gray-200" 
                    style={{ backgroundColor: submission.customColors.primary }}
                  />
                  <div>
                    <div className="font-medium">Podstawowy</div>
                    <div className="text-sm text-gray-600">{submission.customColors.primary}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyColor(submission.customColors.primary)}
                  className="h-8"
                >
                  Kopiuj
                </Button>
              </div>
            )}
            {submission.customColors.secondary && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-md shadow-sm border border-gray-200" 
                    style={{ backgroundColor: submission.customColors.secondary }}
                  />
                  <div>
                    <div className="font-medium">Drugorzędny</div>
                    <div className="text-sm text-gray-600">{submission.customColors.secondary}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyColor(submission.customColors.secondary)}
                  className="h-8"
                >
                  Kopiuj
                </Button>
              </div>
            )}
            {submission.customColors.accent && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-md shadow-sm border border-gray-200" 
                    style={{ backgroundColor: submission.customColors.accent }}
                  />
                  <div>
                    <div className="font-medium">Akcentowy</div>
                    <div className="text-sm text-gray-600">{submission.customColors.accent}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyColor(submission.customColors.accent)}
                  className="h-8"
                >
                  Kopiuj
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 