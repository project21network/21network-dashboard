export interface SeoKeyword {
  id: string;
  name: string;
  description: string;
}

export interface SeoGoals {
  traffic: string[];
  conversion: string[];
  positions: string[];
  custom: string[];
}

export interface SeoHistory {
  previouslyWorked: boolean;
  startDate: string;
  endDate: string;
  previousAgencies: string[];
  previousResults: string;
}

export type SeoSubmissionStatus = "new" | "processing" | "completed";

export interface SeoSubmission {
  id: string;
  name: string;
  email: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  
  // Budżet
  budget: string;
  customBudget: string;
  
  // Cele
  goals: SeoGoals;
  
  // Oczekiwania i informacje
  expectations: string;
  otherInfo: string;
  
  // Wybrane usługi i słowa kluczowe
  selectedServices: string[];
  customServices: any[];
  selectedKeywords: string[];
  customKeywords: SeoKeyword[];
  
  // Konkurencja
  competitors: string[];
  
  // Wyzwania
  challenges: string[];
  
  // Dodatkowe informacje
  additionalInfo: Record<string, any>;
  
  // Historia SEO
  seoHistory: SeoHistory;
  
  // Ramy czasowe
  targetTimeframe: string;
  
  // Status
  status: SeoSubmissionStatus;
  
  // Data aktualizacji
  updatedAt?: Date;
} 