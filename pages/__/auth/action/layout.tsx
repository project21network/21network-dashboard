export default function AuthActionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: 'Akcje autoryzacyjne - 21network',
  description: 'Strona obsługi akcji autoryzacyjnych',
}; 