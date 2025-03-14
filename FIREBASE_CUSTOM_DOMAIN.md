# Konfiguracja niestandardowej domeny w Firebase Authentication

Ten dokument zawiera instrukcje dotyczące konfiguracji niestandardowej domeny (21network.io) dla Firebase Authentication.

## 1. Wymagania wstępne

- Dostęp do konsoli Firebase dla projektu `network-9747b`
- Dostęp do konfiguracji DNS dla domeny `21network.io`
- Uprawnienia administratora do projektu Firebase

## 2. Konfiguracja w konsoli Firebase

1. Zaloguj się do [konsoli Firebase](https://console.firebase.google.com/)
2. Wybierz projekt `network-9747b`
3. W menu bocznym wybierz "Authentication"
4. Przejdź do zakładki "Settings" (Ustawienia)
5. Przejdź do sekcji "Authorized domains" (Autoryzowane domeny)
6. Kliknij "Add domain" (Dodaj domenę) i wprowadź `21network.io`
7. Zapisz zmiany

## 3. Konfiguracja DNS

Aby Firebase Authentication działało poprawnie z niestandardową domeną, musisz dodać rekordy TXT do konfiguracji DNS domeny:

1. Zaloguj się do panelu zarządzania domeną `21network.io`
2. Dodaj następujący rekord TXT:
   - Nazwa: `_firebase`
   - Wartość: `network-9747b`
3. Zapisz zmiany w konfiguracji DNS

Uwaga: Propagacja zmian DNS może zająć do 48 godzin.

## 4. Aktualizacja zmiennych środowiskowych

W pliku `.env.local` aplikacji zaktualizuj zmienną `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`:

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=21network.io
```

## 5. Pliki obsługi autoryzacji

Upewnij się, że w katalogu `public/__/auth/` znajdują się następujące pliki:

- `handler.js` - Główny plik obsługujący przekierowania autoryzacji
- `signInCallback.html` - Strona wyświetlana po zalogowaniu
- `widget.html` - Strona z widgetem logowania
- `iframe.html` - Plik obsługujący autoryzację w iframe
- `emulator.html` - Plik obsługujący autoryzację w środowisku deweloperskim
- `action.html` - Plik obsługujący akcje autoryzacyjne

## 6. Weryfikacja konfiguracji

Po zakończeniu konfiguracji i propagacji zmian DNS, wykonaj następujące kroki, aby zweryfikować poprawność konfiguracji:

1. Otwórz aplikację pod adresem `https://21network.io`
2. Spróbuj zalogować się do aplikacji
3. Sprawdź, czy proces logowania działa poprawnie
4. Sprawdź, czy resetowanie hasła i weryfikacja adresu email działają poprawnie

## 7. Rozwiązywanie problemów

Jeśli napotkasz problemy z autoryzacją, sprawdź:

1. Czy rekord TXT w DNS jest poprawnie skonfigurowany
2. Czy domena `21network.io` jest dodana do autoryzowanych domen w konsoli Firebase
3. Czy pliki w katalogu `public/__/auth/` są poprawnie skonfigurowane
4. Czy zmienna `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` w pliku `.env.local` jest ustawiona na `21network.io`

W przypadku problemów z przekierowaniami po autoryzacji, sprawdź konsole przeglądarki pod kątem błędów.

## 8. Dodatkowe zasoby

- [Dokumentacja Firebase Authentication](https://firebase.google.com/docs/auth)
- [Konfiguracja niestandardowych domen w Firebase](https://firebase.google.com/docs/auth/web/custom-domain)
- [Rozwiązywanie problemów z Firebase Authentication](https://firebase.google.com/docs/auth/web/errors)