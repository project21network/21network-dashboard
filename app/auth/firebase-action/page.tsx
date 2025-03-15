'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset, applyActionCode, checkActionCode } from 'firebase/auth';
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

export default function FirebaseAuthAction() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState('Przetwarzanie...');
  const [message, setMessage] = useState('Proszę czekać, trwa przetwarzanie akcji.');
  const [showSpinner, setShowSpinner] = useState(true);
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');
  const continueUrl = searchParams.get('continueUrl') || '/dashboard';

  useEffect(() => {
    // Inicjalizacja Firebase, jeśli jeszcze nie jest zainicjalizowana
    try {
      if (getApps().length === 0) {
        initializeApp(firebaseConfig);
      }
    } catch (err) {
      console.error('Błąd inicjalizacji Firebase:', err);
    }

    if (!actionCode) {
      setStatus('Błąd');
      setMessage('Brak wymaganego kodu akcji.');
      setShowSpinner(false);
      return;
    }

    const auth = getAuth();
    
    switch (mode) {
      case 'resetPassword':
        // Wyświetl formularz resetowania hasła
        setStatus('Resetowanie hasła');
        setMessage('Wprowadź nowe hasło:');
        setShowSpinner(false);
        setShowResetForm(true);
        break;
        
      case 'verifyEmail':
        // Weryfikacja adresu email
        setStatus('Weryfikacja adresu email');
        setMessage('Trwa weryfikacja...');
        
        applyActionCode(auth, actionCode)
          .then(() => {
            setStatus('Sukces');
            setMessage('Twój adres email został zweryfikowany. Za chwilę nastąpi przekierowanie.');
            setShowSpinner(false);
            
            // Przekierowanie po udanej weryfikacji
            setTimeout(() => {
              router.push(continueUrl);
            }, 3000);
          })
          .catch((error) => {
            setStatus('Błąd');
            setMessage(`Wystąpił błąd: ${error.message}`);
            setShowSpinner(false);
          });
        break;
        
      case 'recoverEmail':
        // Odzyskiwanie adresu email
        setStatus('Odzyskiwanie adresu email');
        setMessage('Trwa odzyskiwanie...');
        
        checkActionCode(auth, actionCode)
          .then(() => {
            return applyActionCode(auth, actionCode);
          })
          .then(() => {
            setStatus('Sukces');
            setMessage('Twój adres email został odzyskany. Za chwilę nastąpi przekierowanie.');
            setShowSpinner(false);
            
            // Przekierowanie po udanym odzyskaniu
            setTimeout(() => {
              router.push('/auth/login?recover=success');
            }, 3000);
          })
          .catch((error) => {
            setStatus('Błąd');
            setMessage(`Wystąpił błąd: ${error.message}`);
            setShowSpinner(false);
          });
        break;
        
      default:
        setStatus('Błąd');
        setMessage('Nieznany typ akcji.');
        setShowSpinner(false);
    }
  }, [mode, actionCode, continueUrl, router]);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actionCode) return;
    
    const auth = getAuth();
    setShowResetForm(false);
    setShowSpinner(true);
    
    verifyPasswordResetCode(auth, actionCode)
      .then(() => {
        return confirmPasswordReset(auth, actionCode, newPassword);
      })
      .then(() => {
        setStatus('Sukces');
        setMessage('Hasło zostało zmienione. Za chwilę nastąpi przekierowanie.');
        setShowSpinner(false);
        
        // Przekierowanie po udanym resecie hasła
        setTimeout(() => {
          router.push('/auth/login?reset=success');
        }, 3000);
      })
      .catch((error) => {
        setStatus('Błąd');
        setMessage(`Wystąpił błąd: ${error.message}`);
        setShowSpinner(false);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">{status}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {showResetForm && (
          <form onSubmit={handleResetPassword} className="mt-4 text-left">
            <div className="mb-4">
              <label htmlFor="newPassword" className="block mb-1 font-medium">Nowe hasło:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
                minLength={6}
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Zmień hasło
            </button>
          </form>
        )}
        
        {showSpinner && (
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mt-4"></div>
        )}
      </div>
    </div>
  );
} 