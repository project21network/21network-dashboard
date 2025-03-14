# Konfiguracja niestandardowej domeny dla Firebase Authentication

Aby zmienić domenę wyświetlaną podczas logowania z "network-9747b.firebaseapp.com" na "21network.io", należy wykonać następujące kroki:

## 1. Konfiguracja w Firebase Console

1. Zaloguj się do [Firebase Console](https://console.firebase.google.com/)
2. Wybierz projekt "network-9747b"
3. Przejdź do sekcji "Authentication" w menu bocznym
4. Kliknij na zakładkę "Settings" (Ustawienia)
5. Przewiń do sekcji "Authorized domains" (Autoryzowane domeny)
6. Kliknij "Add domain" (Dodaj domenę) i dodaj "21network.io"
7. Zapisz zmiany

## 2. Konfiguracja DNS dla domeny 21network.io

1. Zaloguj się do panelu zarządzania domeną 21network.io
2. Dodaj następujące rekordy DNS:

   ```
   Typ: CNAME
   Nazwa: auth
   Wartość: firebaseapp.com
   ```

   ```
   Typ: TXT
   Nazwa: _firebase
   Wartość: [wartość podana przez Firebase podczas weryfikacji]
   ```

3. Poczekaj na propagację DNS (może to zająć do 48 godzin)

## 3. Weryfikacja domeny w Firebase

1. Wróć do Firebase Console
2. Przejdź do sekcji "Authentication" > "Settings"
3. Kliknij przycisk "Verify" obok dodanej domeny
4. Postępuj zgodnie z instrukcjami weryfikacji

## 4. Aktualizacja zmiennych środowiskowych

Plik `.env.local` został już zaktualizowany, aby używać nowej domeny:

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=21network.io
```

## 5. Testowanie

Po zakończeniu konfiguracji i propagacji DNS, podczas logowania powinna być wyświetlana domena "21network.io" zamiast "network-9747b.firebaseapp.com".

## Uwagi

- Proces weryfikacji domeny może zająć do 48 godzin
- Jeśli występują problemy, sprawdź poprawność rekordów DNS
- Upewnij się, że domena jest aktywna i nie wygasła 