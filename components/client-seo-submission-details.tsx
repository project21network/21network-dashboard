import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { SeoSubmission } from "@/lib/types/seo-submission";

interface Props {
  submission: SeoSubmission;
}

export function ClientSeoSubmissionDetails({ submission }: Props): React.JSX.Element {
  // Bezpieczne renderowanie wartości
  function renderValue(value: any): React.ReactNode {
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
            <p className="mt-1">{renderValue(submission.targetTimeframe)}</p>
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