export interface CustomColor {
  accent: string;
  primary: string;
  secondary: string;
}

export interface CustomSection {
  id: string;
  name: string;
  price: number;
  description: string;
}

export type FormSubmissionStatus = "new" | "processing" | "completed";

export interface FormSubmission {
  id: string;
  colorScheme: string;
  contentType: string;
  createdAt: Date;
  customColors: CustomColor;
  customSections: CustomSection[];
  description?: string;
  domainOption: string;
  email: string;
  name: string;
  ownDomain: string;
  photoType: string;
  selectedSections: string[];
  websiteStyle: string;
  status: FormSubmissionStatus;
  updatedAt?: Date;
} 