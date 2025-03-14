export default function AuthHandlerLayout({
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
  title: 'Autoryzacja - 21network',
  description: 'Strona przekierowania po autoryzacji',
}; 