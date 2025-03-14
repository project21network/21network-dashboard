// app/auth/reset-password/page.tsx
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-semibold">21Network</span>
        </Link>
      </div>
      <ResetPasswordForm />
    </div>
  );
}