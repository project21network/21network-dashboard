import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
} 