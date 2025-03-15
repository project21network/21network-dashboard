import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "dashboard.21network.io", // Ustawiamy bezpośrednio domenę
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const AuthHandler = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Inicjalizacja Firebase, jeśli jeszcze nie jest zainicjalizowana
    let app;
    try {
      app = initializeApp(firebaseConfig);
    } catch (err) {
      // App już zainicjalizowana
      console.log('Firebase app already initialized');
    }

    const auth = getAuth(app);
    
    // Ustawienie persystencji
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Konfiguracja Google Provider
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          'auth_domain': 'dashboard.21network.io'
        });

        // Próba logowania
        return signInWithPopup(auth, provider);
      })
      .then((result) => {
        // Pomyślne logowanie
        console.log('Logged in successfully');
        router.push('/dashboard');
      })
      .catch((error) => {
        console.error('Auth error:', error);
        // W przypadku błędu, przekieruj do strony logowania
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
