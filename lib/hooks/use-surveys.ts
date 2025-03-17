import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Survey, SurveyResponse } from "@/lib/types/survey";
import { useAuth } from "./use-auth";

export function useSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    async function fetchSurveys() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all active surveys or all surveys for admin
        const surveysQuery = isAdmin
          ? query(collection(db, "surveys"), orderBy("createdAt", "desc"))
          : query(
              collection(db, "surveys"),
              where("isActive", "==", true),
              orderBy("createdAt", "desc")
            );
        
        const snapshot = await getDocs(surveysQuery);
        const surveysList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate(),
            expiresAt: data.expiresAt?.toDate(),
          } as Survey;
        });
        
        setSurveys(surveysList);
        
        // If admin, fetch all responses, else fetch only user's responses
        if (isAdmin) {
          const responsesQuery = query(
            collection(db, "surveyResponses"),
            orderBy("submittedAt", "desc")
          );
          
          const responsesSnapshot = await getDocs(responsesQuery);
          const responsesList = responsesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              submittedAt: data.submittedAt?.toDate(),
            } as SurveyResponse;
          });
          
          setResponses(responsesList);
        } else {
          const responsesQuery = query(
            collection(db, "surveyResponses"),
            where("userId", "==", user?.uid),
            orderBy("submittedAt", "desc")
          );
          
          const responsesSnapshot = await getDocs(responsesQuery);
          const responsesList = responsesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              submittedAt: data.submittedAt?.toDate(),
            } as SurveyResponse;
          });
          
          setResponses(responsesList);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching surveys:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSurveys();
  }, [user, isAdmin]);

  const getSurvey = async (id: string): Promise<Survey | null> => {
    try {
      const docRef = doc(db, "surveys", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
        } as Survey;
      }
      
      return null;
    } catch (err) {
      console.error("Error fetching survey:", err);
      return null;
    }
  };

  const submitSurveyResponse = async (surveyId: string, answers: SurveyResponse["answers"]): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await addDoc(collection(db, "surveyResponses"), {
        surveyId,
        userId: user.uid,
        userName: user.displayName,
        answers,
        submittedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Error submitting survey response:", err);
      return false;
    }
  };

  return {
    surveys,
    responses,
    isLoading,
    error,
    getSurvey,
    submitSurveyResponse,
  };
}