# Konfiguracja niestandardowej domeny w Firebase Authentication

Ten dokument zawiera instrukcje dotyczące konfiguracji niestandardowej domeny (dashboard.21network.io) dla Firebase Authentication.

## 1. Wymagania wstępne

- Dostęp do konsoli Firebase dla projektu `network-9747b`
- Dostęp do konfiguracji DNS dla domeny `dashboard.21network.io`
- Uprawnienia administratora do projektu Firebase

## 2. Konfiguracja w konsoli Firebase

1. Zaloguj się do [konsoli Firebase](https://console.firebase.google.com/)
2. Wybierz projekt `network-9747b`
3. W menu bocznym wybierz "Authentication"
4. Przejdź do zakładki "Settings" (Ustawienia)
5. Przejdź do sekcji "Authorized domains" (Autoryzowane domeny)
6. Kliknij "Add domain" (Dodaj domenę) i wprowadź `dashboard.21network.io`
7. Zapisz zmiany

## 3. Konfiguracja DNS

Aby Firebase Authentication działało poprawnie z niestandardową domeną, musisz dodać rekordy TXT do konfiguracji DNS domeny:

1. Zaloguj się do panelu zarządzania domeną `dashboard.21network.io`
2. Dodaj następujący rekord TXT:
   - Nazwa: `_firebase`
   - Wartość: `network-9747b`
3. Zapisz zmiany w konfiguracji DNS

Uwaga: Propagacja zmian DNS może zająć do 48 godzin.

## 4. Aktualizacja zmiennych środowiskowych

W pliku `.env.local` aplikacji zaktualizuj zmienną `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`:

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dashboard.21network.io
```

## 5. Obsługa przekierowań w Next.js

W aplikacji Next.js zostały utworzone następujące strony do obsługi przekierowań Firebase Auth:

1. **Strony obsługujące autoryzację**:
   - `app/auth/firebase-handler/page.tsx` - Obsługa przekierowań po uwierzytelnieniu
   - `app/auth/firebase-action/page.tsx` - Obsługa akcji autoryzacyjnych (resetowanie hasła, weryfikacja email)

2. **Middleware do przekierowań**:
   - Plik `middleware.ts` w głównym katalogu projektu zawiera logikę przekierowującą żądania z ścieżki `/__/auth/*` do odpowiednich stron w aplikacji.
   - Dzięki temu Firebase Auth może używać standardowych ścieżek `/__/auth/handler` i `/__/auth/action`, które są automatycznie przekierowywane do naszych stron.

3. **Suspense Boundaries**:
   - Strony używają komponentu `Suspense` do obsługi hooka `useSearchParams()`, co jest wymagane w Next.js App Router.
   - Zapewnia to poprawne renderowanie stron zarówno po stronie serwera, jak i klienta.

4. **Metody logowania**:
   - Logowanie z Google i Apple używa `signInWithRedirect` zamiast `signInWithPopup`
   - Strona `firebase-handler` obsługuje wynik przekierowania i wyświetla odpowiednie komunikaty
   - Dodano obsługę błędów i komunikaty przyjazne dla użytkownika

## 6. Weryfikacja konfiguracji

Po zakończeniu konfiguracji i propagacji zmian DNS, wykonaj następujące kroki, aby zweryfikować poprawność konfiguracji:

1. Otwórz aplikację pod adresem `https://dashboard.21network.io`
2. Spróbuj zalogować się do aplikacji używając różnych metod (email/hasło, Google, Apple)
3. Sprawdź, czy proces logowania działa poprawnie
4. Sprawdź, czy resetowanie hasła i weryfikacja adresu email działają poprawnie

## 7. Rozwiązywanie problemów

Jeśli napotkasz problemy z autoryzacją, sprawdź:

1. Czy rekord TXT w DNS jest poprawnie skonfigurowany
2. Czy domena `dashboard.21network.io` jest dodana do autoryzowanych domen w konsoli Firebase
3. Czy middleware poprawnie przekierowuje żądania z `/__/auth/*` do odpowiednich stron
4. Czy zmienna `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` w pliku `.env.local` jest ustawiona na `dashboard.21network.io`
5. Sprawdź logi w konsoli przeglądarki, aby zobaczyć szczegółowe komunikaty błędów

### Typowe problemy i rozwiązania

#### Problem: Pętla przekierowań podczas logowania

Jeśli występuje pętla przekierowań podczas logowania, sprawdź:

1. Czy używasz `signInWithRedirect` zamiast `signInWithPopup` w funkcjach logowania
2. Czy strona `firebase-handler` poprawnie obsługuje wynik przekierowania
3. Czy middleware poprawnie przekierowuje żądania z `/__/auth/*` do odpowiednich stron

#### Problem: Błąd "auth/operation-not-allowed"

Ten błąd może wystąpić, gdy metoda logowania nie jest włączona w konsoli Firebase:

1. Przejdź do konsoli Firebase > Authentication > Sign-in method
2. Upewnij się, że odpowiednie metody logowania (Google, Apple, Email/Password) są włączone

#### Problem: Błąd "auth/unauthorized-domain"

Ten błąd występuje, gdy domena nie jest autoryzowana w Firebase:

1. Upewnij się, że domena `dashboard.21network.io` jest dodana do autoryzowanych domen w konsoli Firebase
2. Sprawdź, czy używasz poprawnej domeny w konfiguracji Firebase (zmienna `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`)

## 8. Dodatkowe zasoby

- [Dokumentacja Firebase Authentication](https://firebase.google.com/docs/auth)
- [Konfiguracja niestandardowych domen w Firebase](https://firebase.google.com/docs/auth/web/custom-domain)
- [Rozwiązywanie problemów z Firebase Authentication](https://firebase.google.com/docs/auth/web/errors)
- [Dokumentacja Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)