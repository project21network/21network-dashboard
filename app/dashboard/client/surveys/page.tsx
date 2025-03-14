"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSurveys } from "@/lib/hooks/use-surveys";
import { Survey, SurveyResponse } from "@/lib/types/survey";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

export default function ClientSurveysPage() {
  const { surveys, responses, isLoading } = useSurveys();
  
  // Sprawdź, które ankiety zostały już wypełnione
  const getResponsedSurveyIds = (): string[] => {
    return responses.map(response => response.surveyId);
  };
  
  const responsedSurveyIds = getResponsedSurveyIds();
  
  // Filtruj ankiety, które są aktywne i nie zostały jeszcze wypełnione
  const pendingSurveys = surveys.filter(survey => 
    survey.isActive && !responsedSurveyIds.includes(survey.id)
  );
  
  // Ankiety, które zostały wypełnione
  const completedSurveys = surveys.filter(survey => 
    responsedSurveyIds.includes(survey.id)
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ankiety</h1>
      
      <div className="space-y-8">
        {pendingSurveys.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Ankiety do wypełnienia</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingSurveys.map(survey => (
                <SurveyCard 
                  key={survey.id} 
                  survey={survey} 
                  isPending={true} 
                />
              ))}
            </div>
          </div>
        )}
        
        {completedSurveys.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Wypełnione ankiety</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedSurveys.map(survey => (
                <SurveyCard 
                  key={survey.id} 
                  survey={survey} 
                  isPending={false} 
                />
              ))}
            </div>
          </div>
        )}
        
        {pendingSurveys.length === 0 && completedSurveys.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Brak dostępnych ankiet</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SurveyCardProps {
  survey: Survey;
  isPending: boolean;
}

function SurveyCard({ survey, isPending }: SurveyCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{survey.title}</CardTitle>
          <CardDescription>
            Utworzono {formatDistanceToNow(survey.createdAt, { addSuffix: true, locale: pl })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{survey.description}</p>
          <p className="text-sm mt-2">
            {isPending 
              ? `${survey.questions.length} pytań do wypełnienia`
              : `Wypełniono ankietę`
            }
          </p>
        </CardContent>
        <CardFooter>
          {isPending ? (
            // Dla ankiet zewnętrznych możemy przekierować na subdomenę
            // Tu używamy URL ankiety jako parametr (byłby to np. konkretny identyfikator ankiety)
            <Button asChild className="w-full">
              <Link href={`https://ankieta.21network.io/?survey=${survey.id}`} target="_blank">
                Wypełnij ankietę
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" className="w-full" disabled>
              Wypełniono
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }