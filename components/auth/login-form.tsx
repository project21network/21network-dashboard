"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginUser, loginWithGoogle, loginWithApple } from "@/lib/firebase/auth";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

const loginSchema = z.object({
  email: z.string().email({ message: "Proszę podać poprawny adres email" }),
  password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    
    try {
      await loginUser(data.email, data.password);
      toast.success("Zalogowano pomyślnie");
      router.push("/dashboard");
    } catch (error) {
      console.error("Błąd logowania:", error);
      toast.error("Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Zalogowano pomyślnie przez Google");
      router.push("/dashboard");
    } catch (error) {
      console.error("Błąd logowania przez Google:", error);
      toast.error("Nie udało się zalogować przez Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithApple();
      toast.success("Zalogowano pomyślnie przez Apple");
      router.push("/dashboard");
    } catch (error) {
      console.error("Błąd logowania przez Apple:", error);
      toast.error("Nie udało się zalogować przez Apple");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Zaloguj się</CardTitle>
        <CardDescription>
          Wprowadź swoje dane, aby uzyskać dostęp do panelu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Kontynuuj z Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleAppleLogin}
            disabled={isLoading}
          >
            <FaApple className="mr-2 h-4 w-4" />
            Kontynuuj z Apple
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                lub
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="twoj@email.pl" {...field} type="email" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input placeholder="********" {...field} type="password" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          <Link href="/auth/reset-password" className="text-primary hover:underline">
            Zapomniałeś hasła?
          </Link>
        </div>
        <div className="text-sm text-center">
          <span>Nie masz konta? </span>
          <Link href="/auth/register" className="text-primary hover:underline">
            Zarejestruj się
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}