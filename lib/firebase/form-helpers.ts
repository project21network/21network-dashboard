import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

/**
 * Zapisuje formularz strony do Firebase, sprawdzając czy istnieje już formularz o podanym emailu i nazwie.
 * Jeśli tak, to nadpisuje istniejący formularz, w przeciwnym razie tworzy nowy.
 * 
 * @param formData Dane formularza do zapisania
 * @returns ID zapisanego dokumentu
 */
export async function saveFormSubmission(formData: Record<string, any>): Promise<string> {
  try {
    // Sprawdź, czy istnieje już formularz o podanym emailu i nazwie
    const formQuery = query(
      collection(db, "formSubmissions"),
      where("email", "==", formData.email),
      where("name", "==", formData.name)
    );
    
    const snapshot = await getDocs(formQuery);
    
    // Dodaj timestamp i status do danych
    const dataToSave = {
      ...formData,
      status: formData.status || "new", // Domyślny status "new" dla nowych ankiet
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Jeśli znaleziono istniejący formularz, nadpisz go
    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      // Zachowaj istniejący status, jeśli nie został podany nowy
      if (!formData.status && existingDoc.data().status) {
        dataToSave.status = existingDoc.data().status;
      }
      await updateDoc(doc(db, "formSubmissions", existingDoc.id), dataToSave);
      console.log(`Nadpisano istniejący formularz strony (ID: ${existingDoc.id})`);
      return existingDoc.id;
    }
    
    // W przeciwnym razie utwórz nowy dokument
    const docRef = await addDoc(collection(db, "formSubmissions"), dataToSave);
    console.log(`Utworzono nowy formularz strony (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error("Błąd podczas zapisywania formularza strony:", error);
    throw error;
  }
}

/**
 * Zapisuje formularz SEO do Firebase, sprawdzając czy istnieje już formularz o podanym emailu i nazwie.
 * Jeśli tak, to nadpisuje istniejący formularz, w przeciwnym razie tworzy nowy.
 * 
 * @param formData Dane formularza do zapisania
 * @returns ID zapisanego dokumentu
 */
export async function saveSeoFormSubmission(formData: Record<string, any>): Promise<string> {
  try {
    // Sprawdź, czy istnieje już formularz o podanym emailu i nazwie
    const formQuery = query(
      collection(db, "seoFormSubmissions"),
      where("email", "==", formData.email),
      where("name", "==", formData.name)
    );
    
    const snapshot = await getDocs(formQuery);
    
    // Dodaj timestamp i status do danych
    const dataToSave = {
      ...formData,
      status: formData.status || "new", // Domyślny status "new" dla nowych ankiet
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Jeśli znaleziono istniejący formularz, nadpisz go
    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      // Zachowaj istniejący status, jeśli nie został podany nowy
      if (!formData.status && existingDoc.data().status) {
        dataToSave.status = existingDoc.data().status;
      }
      await updateDoc(doc(db, "seoFormSubmissions", existingDoc.id), dataToSave);
      console.log(`Nadpisano istniejący formularz SEO (ID: ${existingDoc.id})`);
      return existingDoc.id;
    }
    
    // W przeciwnym razie utwórz nowy dokument
    const docRef = await addDoc(collection(db, "seoFormSubmissions"), dataToSave);
    console.log(`Utworzono nowy formularz SEO (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error("Błąd podczas zapisywania formularza SEO:", error);
    throw error;
  }
}

/**
 * Aktualizuje status ankiety WWW
 * 
 * @param id ID ankiety
 * @param status Nowy status
 * @returns void
 */
export async function updateFormSubmissionStatus(id: string, status: string): Promise<void> {
  try {
    const docRef = doc(db, "formSubmissions", id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
    console.log(`Zaktualizowano status ankiety WWW (ID: ${id}) na: ${status}`);
  } catch (error) {
    console.error(`Błąd podczas aktualizacji statusu ankiety WWW (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * Aktualizuje status ankiety SEO
 * 
 * @param id ID ankiety
 * @param status Nowy status
 * @returns void
 */
export async function updateSeoSubmissionStatus(id: string, status: string): Promise<void> {
  try {
    const docRef = doc(db, "seoFormSubmissions", id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
    console.log(`Zaktualizowano status ankiety SEO (ID: ${id}) na: ${status}`);
  } catch (error) {
    console.error(`Błąd podczas aktualizacji statusu ankiety SEO (ID: ${id}):`, error);
    throw error;
  }
} 