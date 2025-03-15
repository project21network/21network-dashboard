// pages/__/auth/handler.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthHandler() {
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Przenieś użytkownika do strony docelowej po uwierzytelnieniu
      router.push('/dashboard');
    }
  }, [router]);

  return <p>Przekierowywanie...</p>;
}