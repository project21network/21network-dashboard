import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-semibold">21Network</span>
        </Link>
      </div>
      <LoginForm />
    </div>
  );
}