// pages/__/auth/handler.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { getAuth, getRedirectResult } from 'firebase/auth';
import { app } from '@/lib/firebase/config';

const AuthHandler: NextPage = () => {
  const router = useRouter();
  
  useEffect(() => {
    const auth = getAuth(app);
    
    // Obsługa przekierowania z Google Auth
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // Użytkownik został pomyślnie zalogowany
          console.log('Zalogowano pomyślnie:', result.user.email);
          router.push('/dashboard');
        } else {
          // Brak wyniku logowania, przekieruj z powrotem do strony logowania
          console.log('Brak wyniku logowania');
          router.push('/auth/login');
        }
      })
      .catch((error) => {
        // Wystąpił błąd podczas logowania
        console.error('Błąd logowania:', error);
        router.push('/auth/login?error=' + encodeURIComponent(error.message));
      });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Trwa logowanie...
        </h2>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthHandler;