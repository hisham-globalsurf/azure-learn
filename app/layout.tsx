import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SWA - Test",
  description: "Testing Azure services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html style={{ overflow: "hidden" }} className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
          {children}
      </body>
    </html>
  );
}
