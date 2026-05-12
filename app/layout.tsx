import "./globals.css";
import AppHeader from "@/app/components/shared/AppHeader";
import AuthListener from "@/app/components/shared/AuthListener";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AuthListener />
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
