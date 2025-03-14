export interface Survey {
    id: string;
    title: string;
    description: string;
    questions: SurveyQuestion[];
    createdAt: Date;
    expiresAt?: Date;
    isActive: boolean;
  }
  
  export type QuestionType = 
    | "text"
    | "textarea"
    | "radio"
    | "checkbox"
    | "select"
    | "rating";
  
  export interface SurveyQuestion {
    id: string;
    type: QuestionType;
    question: string;
    isRequired: boolean;
    options?: string[];
  }
  
  export interface SurveyResponse {
    id: string;
    surveyId: string;
    userId: string;
    userName: string;
    answers: SurveyAnswer[];
    submittedAt: Date;
  }
  
  export interface SurveyAnswer {
    questionId: string;
    response: string | string[] | number;
  }