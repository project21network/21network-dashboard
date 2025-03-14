import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-semibold text-xl">21Network</div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Zaloguj się</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Zarejestruj się</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Panel administracyjny 21Network</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Zarządzaj zamówieniami, wypełniaj ankiety i komunikuj się z administracją
            w jednym miejscu.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/login">Przejdź do panelu</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register">Załóż konto</Link>
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} 21Network. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}