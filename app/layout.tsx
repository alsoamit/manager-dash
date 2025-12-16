import "./globals.css";
import RootProvider from "@/providers/RootProvider";

export default async function RootLayout({ children }: any) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
