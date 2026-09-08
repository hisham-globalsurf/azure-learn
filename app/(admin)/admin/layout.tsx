import type { Metadata } from "next";
import "../../../app/globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Brighton | Backend Console",
  description: "Brighton",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased overflow-hidden`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
