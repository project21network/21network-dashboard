import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FormSubmission } from "@/lib/types/form-submission";

export function useFormSubmissions() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchSubmissions() {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching form submissions...");
        const submissionsQuery = query(
          collection(db, "formSubmissions"),
          orderBy("createdAt", "desc")
        );
        
        const snapshot = await getDocs(submissionsQuery);
        console.log(`Received ${snapshot.docs.length} submissions`);
        
        if (!isMounted) return;
        
        const submissionsList = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // Bezpieczna konwersja daty
          let createdAt: Date;
          if (data.createdAt instanceof Timestamp) {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          } else {
            createdAt = new Date();
          }
          
          return {
            ...data,
            id: doc.id,
            createdAt,
            // Upewnij się, że pola są poprawnie zainicjowane
            selectedSections: Array.isArray(data.selectedSections) ? data.selectedSections : [],
            customSections: Array.isArray(data.customSections) ? data.customSections : [],
            status: data.status || 'new',
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
          } as FormSubmission;
        });
        
        if (isMounted) {
          setSubmissions(submissionsList);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching form submissions:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    }
    
    fetchSubmissions();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const getSubmission = async (id: string): Promise<FormSubmission | null> => {
    if (!id) {
      console.error("getSubmission called with empty ID");
      return null;
    }
    
    try {
      console.log(`Getting submission details for ID: ${id}`);
      const docRef = doc(db, "formSubmissions", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log(`No submission found with ID: ${id}`);
        return null;
      }
      
      const data = docSnap.data();
      console.log(`Raw submission data for ID ${id}:`, JSON.stringify(data, null, 2));
      
      if (!data) {
        console.error(`Data is null or undefined for submission ${id}`);
        return null;
      }
      
      // Bezpieczna konwersja daty
      let createdAt: Date;
      if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate();
        console.log(`createdAt is Timestamp instance for submission ${id}`);
      } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate();
        console.log(`createdAt has toDate function for submission ${id}`);
      } else {
        createdAt = new Date();
        console.warn(`Invalid createdAt for submission ${id}, using current date`);
      }
      
      // Upewnij się, że selectedSections jest tablicą
      const selectedSections = Array.isArray(data.selectedSections) 
        ? data.selectedSections 
        : [];
      
      if (!Array.isArray(data.selectedSections)) {
        console.warn(`selectedSections is not an array for submission ${id}`);
      } else {
        console.log(`selectedSections for submission ${id}:`, data.selectedSections);
      }
        
      // Upewnij się, że customSections jest tablicą
      const customSections = Array.isArray(data.customSections) 
        ? data.customSections 
        : [];
      
      if (!Array.isArray(data.customSections)) {
        console.warn(`customSections is not an array for submission ${id}`);
      } else {
        console.log(`customSections for submission ${id}:`, data.customSections);
      }
      
      // Upewnij się, że customColors jest obiektem
      const customColors = data.customColors && typeof data.customColors === 'object'
        ? data.customColors
        : { primary: '', secondary: '', accent: '' };
      
      if (!data.customColors || typeof data.customColors !== 'object') {
        console.warn(`customColors is not an object for submission ${id}`);
      } else {
        console.log(`customColors for submission ${id}:`, data.customColors);
      }
      
      // Tworzenie obiektu submission z bezpiecznymi wartościami domyślnymi
      const submission: FormSubmission = {
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        createdAt,
        websiteStyle: data.websiteStyle || '',
        colorScheme: data.colorScheme || '',
        photoType: data.photoType || '',
        domainOption: data.domainOption || '',
        ownDomain: data.ownDomain || '',
        contentType: data.contentType || '',
        description: data.description || '',
        customColors,
        selectedSections,
        customSections,
        status: data.status || 'new',
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
      };
      
      // Sprawdź, czy wszystkie wymagane pola są obecne
      const requiredFields = ['id', 'name', 'email', 'createdAt'];
      const missingFields = requiredFields.filter(field => !submission[field as keyof FormSubmission]);
      
      if (missingFields.length > 0) {
        console.warn(`Missing required fields for submission ${id}: ${missingFields.join(', ')}`);
      }
      
      console.log(`Processed submission data for ID ${id}:`, JSON.stringify(submission, (key, value) => {
        if (key === 'createdAt') return value instanceof Date ? value.toISOString() : value;
        return value;
      }, 2));
      
      return submission;
    } catch (err) {
      console.error(`Error fetching form submission with ID ${id}:`, err);
      return null;
    }
  };

  return {
    submissions,
    isLoading,
    error,
    getSubmission,
  };
} 