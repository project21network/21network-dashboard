'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, getRedirectResult } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export default function AuthHandler() {
  const router = useRouter();
  
  useEffect(() => {
    // Inicjalizacja Firebase, jeśli jeszcze nie jest zainicjalizowana
    try {
      if (getApps().length === 0) {
        initializeApp(firebaseConfig);
      }
    } catch (err) {
      console.error('Błąd inicjalizacji Firebase:', err);
    }

    const auth = getAuth();
    
    // Obsługa przekierowania po uwierzytelnieniu
    getRedirectResult(auth)
      .then((result) => {
        // Przekierowanie do strony głównej po pomyślnej autoryzacji
        router.push('/dashboard');
      })
      .catch((error) => {
        // Obsługa błędów
        console.error('Błąd autoryzacji:', error);
        // Przekierowanie do strony logowania w przypadku błędu
        router.push(`/auth/login?error=${encodeURIComponent(error.message)}`);
      });
  }, [router]);

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