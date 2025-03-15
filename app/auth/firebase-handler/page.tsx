'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, getRedirectResult } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import Link from 'next/link';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Trwa logowanie...</h2>
        <p className="text-gray-600 mb-4">Proszę czekać, jesteś przekierowywany.</p>
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

function SuccessDisplay() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-green-600">Zalogowano pomyślnie!</h2>
        <p className="text-gray-600 mb-4">Za chwilę nastąpi przekierowanie do panelu.</p>
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mt-4"></div>
      </div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Błąd logowania</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link 
          href="/auth/login" 
          className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Powrót do strony logowania
        </Link>
      </div>
    </div>
  );
}

function FirebaseAuthHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    // Inicjalizacja Firebase, jeśli jeszcze nie jest zainicjalizowana
    try {
      if (getApps().length === 0) {
        initializeApp(firebaseConfig);
      }
    } catch (err) {
      console.error('Błąd inicjalizacji Firebase:', err);
      setError('Błąd inicjalizacji Firebase. Spróbuj ponownie później.');
      setIsProcessing(false);
      return;
    }

    const auth = getAuth();
    
    // Sprawdź, czy to jest akcja (resetowanie hasła, weryfikacja email)
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
    if (mode && oobCode) {
      // Obsługa akcji autoryzacyjnych
      router.push(`/auth/firebase-action?mode=${mode}&oobCode=${oobCode}${
        searchParams.get('continueUrl') ? `&continueUrl=${searchParams.get('continueUrl')}` : ''
      }`);
      return;
    }
    
    // Obsługa przekierowania po uwierzytelnieniu
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          // Pomyślna autoryzacja
          setIsSuccess(true);
          setIsProcessing(false);
          
          // Przekierowanie do strony głównej po krótkim opóźnieniu
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          // Brak wyniku autoryzacji, ale też brak błędu
          setError('Nie udało się zalogować. Spróbuj ponownie.');
          setIsProcessing(false);
        }
      })
      .catch((error) => {
        // Obsługa błędów
        console.error('Błąd autoryzacji:', error);
        
        // Mapowanie kodów błędów na przyjazne komunikaty
        let errorMessage = 'Wystąpił nieznany błąd podczas logowania.';
        
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Okno logowania zostało zamknięte. Spróbuj ponownie.';
        } else if (error.code === 'auth/cancelled-popup-request') {
          errorMessage = 'Żądanie logowania zostało anulowane. Spróbuj ponownie.';
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = 'Wyskakujące okienko zostało zablokowane przez przeglądarkę. Sprawdź ustawienia przeglądarki.';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
          errorMessage = 'Konto z tym adresem email już istnieje, ale z inną metodą logowania.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        setIsProcessing(false);
      });
  }, [router, searchParams]);

  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  if (isSuccess) {
    return <SuccessDisplay />;
  }

  return isProcessing ? <LoadingSpinner /> : null;
}

export default function FirebaseAuthHandler() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FirebaseAuthHandlerContent />
    </Suspense>
  );
} 