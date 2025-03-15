import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
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
    try {
      initializeApp(firebaseConfig);
    } catch (err) {
      // App już zainicjalizowana
      console.log('Firebase app already initialized');
    }

    const auth = getAuth();
    
    // Przekierowanie do strony głównej lub innej strony po uwierzytelnieniu
    router.push('/dashboard');
  }, []);

  return <div>Przekierowywanie...</div>;
};

export default AuthHandler; 