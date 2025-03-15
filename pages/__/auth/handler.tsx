// pages/__/auth/handler.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

const AuthHandler: NextPage = () => {
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Przenieś użytkownika do strony docelowej po uwierzytelnieniu
      router.push('/dashboard');
    }
  }, [router]);

  return <p>Przekierowywanie...</p>;
};

export default AuthHandler;