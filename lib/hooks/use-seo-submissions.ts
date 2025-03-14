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
import { SeoSubmission, SeoGoals, SeoHistory } from "@/lib/types/seo-submission";

export function useSeoSubmissions() {
  const [submissions, setSubmissions] = useState<SeoSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchSubmissions() {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching SEO form submissions...");
        const submissionsQuery = query(
          collection(db, "seoFormSubmissions"),
          orderBy("createdAt", "desc")
        );
        
        const snapshot = await getDocs(submissionsQuery);
        console.log(`Received ${snapshot.docs.length} SEO submissions`);
        
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
          
          // Bezpieczne tworzenie obiektu goals
          const goals: SeoGoals = {
            traffic: Array.isArray(data.goals?.traffic) ? data.goals.traffic : [],
            conversion: Array.isArray(data.goals?.conversion) ? data.goals.conversion : [],
            positions: Array.isArray(data.goals?.positions) ? data.goals.positions : [],
            custom: Array.isArray(data.goals?.custom) ? data.goals.custom : [],
          };
          
          // Bezpieczne tworzenie obiektu seoHistory
          const seoHistory: SeoHistory = {
            previouslyWorked: !!data.seoHistory?.previouslyWorked,
            startDate: data.seoHistory?.startDate || '',
            endDate: data.seoHistory?.endDate || '',
            previousAgencies: Array.isArray(data.seoHistory?.previousAgencies) ? data.seoHistory.previousAgencies : [],
            previousResults: data.seoHistory?.previousResults || '',
          };
          
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            description: data.description || '',
            websiteUrl: data.websiteUrl || '',
            createdAt,
            budget: data.budget || '',
            customBudget: data.customBudget || '',
            goals,
            expectations: data.expectations || '',
            otherInfo: data.otherInfo || '',
            selectedServices: Array.isArray(data.selectedServices) ? data.selectedServices : [],
            customServices: Array.isArray(data.customServices) ? data.customServices : [],
            selectedKeywords: Array.isArray(data.selectedKeywords) ? data.selectedKeywords : [],
            customKeywords: Array.isArray(data.customKeywords) ? data.customKeywords : [],
            competitors: Array.isArray(data.competitors) ? data.competitors : [],
            challenges: Array.isArray(data.challenges) ? data.challenges : [],
            additionalInfo: data.additionalInfo || {},
            seoHistory,
            targetTimeframe: data.targetTimeframe || '',
            status: data.status || 'new',
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
          } as SeoSubmission;
        });
        
        if (isMounted) {
          setSubmissions(submissionsList);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching SEO form submissions:", err);
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

  const getSubmission = async (id: string): Promise<SeoSubmission | null> => {
    if (!id) {
      console.error("getSubmission called with empty ID");
      return null;
    }
    
    try {
      console.log(`Getting SEO submission details for ID: ${id}`);
      const docRef = doc(db, "seoFormSubmissions", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log(`No SEO submission found with ID: ${id}`);
        return null;
      }
      
      const data = docSnap.data();
      console.log(`Raw SEO submission data for ID ${id}:`, JSON.stringify(data, null, 2));
      
      if (!data) {
        console.error(`Data is null or undefined for SEO submission ${id}`);
        return null;
      }
      
      // Bezpieczna konwersja daty
      let createdAt: Date;
      if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate();
      } else {
        createdAt = new Date();
        console.warn(`Invalid createdAt for SEO submission ${id}, using current date`);
      }
      
      // Bezpieczne tworzenie obiektu goals
      const goals: SeoGoals = {
        traffic: Array.isArray(data.goals?.traffic) ? data.goals.traffic : [],
        conversion: Array.isArray(data.goals?.conversion) ? data.goals.conversion : [],
        positions: Array.isArray(data.goals?.positions) ? data.goals.positions : [],
        custom: Array.isArray(data.goals?.custom) ? data.goals.custom : [],
      };
      
      // Bezpieczne tworzenie obiektu seoHistory
      const seoHistory: SeoHistory = {
        previouslyWorked: !!data.seoHistory?.previouslyWorked,
        startDate: data.seoHistory?.startDate || '',
        endDate: data.seoHistory?.endDate || '',
        previousAgencies: Array.isArray(data.seoHistory?.previousAgencies) ? data.seoHistory.previousAgencies : [],
        previousResults: data.seoHistory?.previousResults || '',
      };
      
      // Tworzenie obiektu submission z bezpiecznymi wartościami domyślnymi
      const submission: SeoSubmission = {
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        description: data.description || '',
        websiteUrl: data.websiteUrl || '',
        createdAt,
        budget: data.budget || '',
        customBudget: data.customBudget || '',
        goals,
        expectations: data.expectations || '',
        otherInfo: data.otherInfo || '',
        selectedServices: Array.isArray(data.selectedServices) ? data.selectedServices : [],
        customServices: Array.isArray(data.customServices) ? data.customServices : [],
        selectedKeywords: Array.isArray(data.selectedKeywords) ? data.selectedKeywords : [],
        customKeywords: Array.isArray(data.customKeywords) ? data.customKeywords : [],
        competitors: Array.isArray(data.competitors) ? data.competitors : [],
        challenges: Array.isArray(data.challenges) ? data.challenges : [],
        additionalInfo: data.additionalInfo || {},
        seoHistory,
        targetTimeframe: data.targetTimeframe || '',
        status: data.status || 'new',
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
      };
      
      console.log(`Processed SEO submission data for ID ${id}:`, JSON.stringify(submission, (key, value) => {
        if (key === 'createdAt') return value instanceof Date ? value.toISOString() : value;
        return value;
      }, 2));
      
      return submission;
    } catch (err) {
      console.error(`Error fetching SEO submission with ID ${id}:`, err);
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