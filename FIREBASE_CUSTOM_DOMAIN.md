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

W aplikacji Next.js należy utworzyć odpowiednie strony do obsługi przekierowań Firebase Auth:

1. Utwórz następujące pliki:
   - `app/__/auth/handler/page.tsx` - Obsługa przekierowań po uwierzytelnieniu
   - `app/__/auth/action/page.tsx` - Obsługa akcji autoryzacyjnych (resetowanie hasła, weryfikacja email)

2. Pliki te powinny zawierać kod obsługujący odpowiednie operacje Firebase Auth:
   - Przekierowanie po uwierzytelnieniu
   - Resetowanie hasła
   - Weryfikacja adresu email
   - Odzyskiwanie adresu email

## 6. Weryfikacja konfiguracji

Po zakończeniu konfiguracji i propagacji zmian DNS, wykonaj następujące kroki, aby zweryfikować poprawność konfiguracji:

1. Otwórz aplikację pod adresem `https://dashboard.21network.io`
2. Spróbuj zalogować się do aplikacji
3. Sprawdź, czy proces logowania działa poprawnie
4. Sprawdź, czy resetowanie hasła i weryfikacja adresu email działają poprawnie

## 7. Rozwiązywanie problemów

Jeśli napotkasz problemy z autoryzacją, sprawdź:

1. Czy rekord TXT w DNS jest poprawnie skonfigurowany
2. Czy domena `dashboard.21network.io` jest dodana do autoryzowanych domen w konsoli Firebase
3. Czy pliki obsługujące przekierowania są poprawnie zaimplementowane w aplikacji Next.js
4. Czy zmienna `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` w pliku `.env.local` jest ustawiona na `dashboard.21network.io`

W przypadku problemów z przekierowaniami po autoryzacji, sprawdź konsole przeglądarki pod kątem błędów.

## 8. Dodatkowe zasoby

- [Dokumentacja Firebase Authentication](https://firebase.google.com/docs/auth)
- [Konfiguracja niestandardowych domen w Firebase](https://firebase.google.com/docs/auth/web/custom-domain)
- [Rozwiązywanie problemów z Firebase Authentication](https://firebase.google.com/docs/auth/web/errors)