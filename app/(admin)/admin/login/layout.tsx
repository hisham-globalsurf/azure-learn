export const metadata = {
  title: "SWA Test App | Backend Console",
  description: "SWA",
};

import "../../../globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="en" className={`antialiased`}>
      {children}
    </div>
  );
}
