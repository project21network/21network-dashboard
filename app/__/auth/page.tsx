'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
    if (mode && oobCode) {
      // Jeśli mamy parametry akcji, przekieruj do strony action
      router.push(`/__/auth/action?mode=${mode}&oobCode=${oobCode}${
        searchParams.get('continueUrl') ? `&continueUrl=${searchParams.get('continueUrl')}` : ''
      }`);
    } else {
      // W przeciwnym razie przekieruj do strony handler
      router.push('/__/auth/handler');
    }
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Przekierowywanie...</h2>
        <p className="text-gray-600 mb-4">Proszę czekać.</p>
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
} 