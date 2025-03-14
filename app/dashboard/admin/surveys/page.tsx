"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSurveys } from "@/lib/hooks/use-surveys";
import { Survey, SurveyResponse } from "@/lib/types/survey";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { FileTextOutlined, BarChartOutlined } from "@ant-design/icons";

export default function AdminSurveysPage() {
  const { surveys, responses, isLoading } = useSurveys();
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<SurveyResponse[]>([]);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  
  const handleViewResponses = (surveyId: string) => {
    const surveyResponses = responses.filter(r => r.surveyId === surveyId);
    const survey = surveys.find(s => s.id === surveyId) || null;
    
    setSelectedSurvey(survey);
    setSelectedResponses(surveyResponses);
    setIsResponseModalOpen(true);
  };
  
  // Liczba odpowiedzi na ankietę
  const getResponsesCount = (surveyId: string): number => {
    return responses.filter(r => r.surveyId === surveyId).length;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ankiety klientów</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12">
            <p className="text-muted-foreground">Brak dostępnych ankiet</p>
          </div>
        ) : (
          surveys.map((survey) => (
            <Card key={survey.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{survey.title}</CardTitle>
                    <CardDescription>
                      Utworzono {format(survey.createdAt, "dd MMM yyyy", { locale: pl })}
                    </CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    survey.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {survey.isActive ? 'Aktywna' : 'Nieaktywna'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">{survey.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium">Liczba pytań:</div>
                      <div>{survey.questions.length}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Liczba odpowiedzi:</div>
                      <div>{getResponsesCount(survey.id)}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={() => handleViewResponses(survey.id)}
                      disabled={getResponsesCount(survey.id) === 0}
                      className="w-full"
                    >
                      <BarChartOutlined className="mr-2" />
                      Pokaż odpowiedzi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Odpowiedzi na ankietę</DialogTitle>
            <DialogDescription>
              {selectedSurvey && (
                <span>Ankieta: {selectedSurvey.title}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {selectedResponses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Brak odpowiedzi na tę ankietę</p>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedResponses.map((response) => (
                  <Card key={response.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">
                          {response.userName}
                        </CardTitle>
                        <CardDescription>
                          {format(response.submittedAt, "dd MMM yyyy, HH:mm", { locale: pl })}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedSurvey && selectedSurvey.questions.map((question) => {
                          const answer = response.answers.find(a => a.questionId === question.id);
                          
                          return (
                            <div key={question.id} className="border-b pb-2 last:border-b-0">
                              <div className="font-medium text-sm">{question.question}</div>
                              <div className="text-sm mt-1">
                                {answer ? (
                                  typeof answer.response === 'object' 
                                    ? (answer.response as string[]).join(", ")
                                    : answer.response.toString()
                                ) : (
                                  <span className="text-muted-foreground">Brak odpowiedzi</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}