// Firebase Auth Handler
(function() {
  // Konfiguracja Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyB0RkLQ_7E1fzM8pF5ihhN8y0xDNhIT8jc",
    authDomain: "21network.io",
    projectId: "network-9747b",
    storageBucket: "network-9747b.firebasestorage.app",
    messagingSenderId: "68411983741",
    appId: "1:68411983741:web:6d6a44d311b777d916ae14",
    measurementId: "G-7Y4BWTSJQH"
  };

  // Funkcja do ładowania skryptów Firebase
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }

  // Ładowanie Firebase App
  loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js', function() {
    // Ładowanie Firebase Auth
    loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js', function() {
      // Inicjalizacja Firebase
      firebase.initializeApp(firebaseConfig);

      // Obsługa przekierowania autoryzacji
      firebase.auth().getRedirectResult()
        .then((result) => {
          // Przekierowanie do strony głównej po pomyślnej autoryzacji
          window.location.href = '/dashboard';
        })
        .catch((error) => {
          // Obsługa błędów
          console.error('Błąd autoryzacji:', error);
          // Przekierowanie do strony logowania w przypadku błędu
          window.location.href = '/auth/login?error=' + encodeURIComponent(error.message);
        });
    });
  });
})(); 