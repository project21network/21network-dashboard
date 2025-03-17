// components/auth/reset-password-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { resetPassword } from "@/lib/firebase/auth";
import { toast } from "sonner";

const resetSchema = z.object({
  email: z.string().email({ message: "Proszę podać poprawny adres email" }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ResetFormValues) {
    setIsLoading(true);
    
    try {
      await resetPassword(data.email);
      setIsSuccess(true);
      toast.success("Instrukcja resetowania hasła została wysłana na podany adres email");
    } catch (error) {
      toast.error("Wystąpił błąd. Sprawdź podany email i spróbuj ponownie.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Resetuj hasło</CardTitle>
        <CardDescription>
          Podaj swój adres email, aby zresetować hasło
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="text-center py-4">
            <p className="mb-4">Instrukcja resetowania hasła została wysłana na podany adres email.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Sprawdź swoją skrzynkę i postępuj zgodnie z instrukcjami zawartymi w wiadomości.
            </p>
            <Button asChild className="mt-2">
              <Link href="/auth/login">Powrót do logowania</Link>
            </Button>
          </div>
          ) : (
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Wysyłanie..." : "Resetuj hasło"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        {!isSuccess && (
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              <Link href="/auth/login" className="text-primary hover:underline">
                Powrót do logowania
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }