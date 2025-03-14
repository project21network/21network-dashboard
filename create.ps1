# Utwórz strukturę katalogów i plików

# Katalogi app
New-Item -Path "app" -ItemType Directory -Force
New-Item -Path "app\auth" -ItemType Directory -Force
New-Item -Path "app\auth\login" -ItemType Directory -Force
New-Item -Path "app\auth\register" -ItemType Directory -Force
New-Item -Path "app\auth\reset-password" -ItemType Directory -Force
New-Item -Path "app\dashboard" -ItemType Directory -Force
New-Item -Path "app\dashboard\admin" -ItemType Directory -Force
New-Item -Path "app\dashboard\admin\clients" -ItemType Directory -Force
New-Item -Path "app\dashboard\admin\orders" -ItemType Directory -Force
New-Item -Path "app\dashboard\admin\surveys" -ItemType Directory -Force
New-Item -Path "app\dashboard\admin\chat" -ItemType Directory -Force
New-Item -Path "app\dashboard\client" -ItemType Directory -Force
New-Item -Path "app\dashboard\client\orders" -ItemType Directory -Force
New-Item -Path "app\dashboard\client\surveys" -ItemType Directory -Force
New-Item -Path "app\dashboard\client\chat" -ItemType Directory -Force
New-Item -Path "app\api" -ItemType Directory -Force
New-Item -Path "app\api\auth" -ItemType Directory -Force
New-Item -Path "app\api\auth\[...nextauth]" -ItemType Directory -Force

# Katalogi components
New-Item -Path "components" -ItemType Directory -Force
New-Item -Path "components\ui" -ItemType Directory -Force
New-Item -Path "components\auth" -ItemType Directory -Force
New-Item -Path "components\dashboard" -ItemType Directory -Force
New-Item -Path "components\admin" -ItemType Directory -Force
New-Item -Path "components\client" -ItemType Directory -Force

# Katalogi lib
New-Item -Path "lib" -ItemType Directory -Force
New-Item -Path "lib\firebase" -ItemType Directory -Force
New-Item -Path "lib\hooks" -ItemType Directory -Force
New-Item -Path "lib\utils" -ItemType Directory -Force
New-Item -Path "lib\types" -ItemType Directory -Force

# Katalogi public
New-Item -Path "public" -ItemType Directory -Force
New-Item -Path "public\images" -ItemType Directory -Force

# Pliki w app
New-Item -Path "app\layout.tsx" -ItemType File -Force
New-Item -Path "app\page.tsx" -ItemType File -Force
New-Item -Path "app\globals.css" -ItemType File -Force
New-Item -Path "app\auth\login\page.tsx" -ItemType File -Force
New-Item -Path "app\auth\register\page.tsx" -ItemType File -Force
New-Item -Path "app\auth\reset-password\page.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\layout.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\page.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\admin\clients\page.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\admin\orders\page.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\admin\surveys\page.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\admin\chat\page.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\client\orders\page.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\client\surveys\page.tsx" -ItemType File -Force
New-Item -Path "app\dashboard\client\chat\page.tsx" -ItemType File -Force
New-Item -Path "app\api\auth\[...nextauth]\route.ts" -ItemType File -Force

# Pliki w components
New-Item -Path "components\auth\login-form.tsx" -ItemType File -Force
New-Item -Path "components\auth\register-form.tsx" -ItemType File -Force
New-Item -Path "components\auth\reset-password-form.tsx" -ItemType File -Force
New-Item -Path "components\dashboard\sidebar-navigation.tsx" -ItemType File -Force
New-Item -Path "components\dashboard\header.tsx" -ItemType File -Force
New-Item -Path "components\dashboard\user-avatar.tsx" -ItemType File -Force
New-Item -Path "components\admin\client-table.tsx" -ItemType File -Force
New-Item -Path "components\admin\order-table.tsx" -ItemType File -Force
New-Item -Path "components\admin\survey-list.tsx" -ItemType File -Force
New-Item -Path "components\admin\chat-interface.tsx" -ItemType File -Force
New-Item -Path "components\client\order-list.tsx" -ItemType File -Force
New-Item -Path "components\client\survey-form.tsx" -ItemType File -Force
New-Item -Path "components\client\chat-interface.tsx" -ItemType File -Force

# Pliki w lib
New-Item -Path "lib\firebase\config.ts" -ItemType File -Force
New-Item -Path "lib\firebase\auth.ts" -ItemType File -Force
New-Item -Path "lib\firebase\firestore.ts" -ItemType File -Force
New-Item -Path "lib\firebase\storage.ts" -ItemType File -Force
New-Item -Path "lib\hooks\use-auth.ts" -ItemType File -Force
New-Item -Path "lib\hooks\use-clients.ts" -ItemType File -Force
New-Item -Path "lib\hooks\use-orders.ts" -ItemType File -Force
New-Item -Path "lib\hooks\use-surveys.ts" -ItemType File -Force
New-Item -Path "lib\hooks\use-chat.ts" -ItemType File -Force
New-Item -Path "lib\utils\date-formatter.ts" -ItemType File -Force
New-Item -Path "lib\utils\validation-schemas.ts" -ItemType File -Force
New-Item -Path "lib\types\user.ts" -ItemType File -Force
New-Item -Path "lib\types\order.ts" -ItemType File -Force
New-Item -Path "lib\types\survey.ts" -ItemType File -Force
New-Item -Path "lib\types\chat.ts" -ItemType File -Force

# Pliki w public
New-Item -Path "public\images\logo.svg" -ItemType File -Force
New-Item -Path "public\favicon.ico" -ItemType File -Force

# Pliki główne
New-Item -Path "middleware.ts" -ItemType File -Force
New-Item -Path "next.config.js" -ItemType File -Force
New-Item -Path "tailwind.config.js" -ItemType File -Force
New-Item -Path "tsconfig.json" -ItemType File -Force

Write-Host "Struktura plików została utworzona!"