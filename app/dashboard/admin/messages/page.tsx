"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminMessagesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/admin/chat");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-medium mb-2">Przekierowywanie...</h2>
        <p className="text-muted-foreground">Trwa przekierowanie do czatu z klientami.</p>
      </div>
    </div>
  );
} 