import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";


export const metadata: Metadata = {
  title: {
    default: "Orbital",
    template: "%s",
  },
  description: "Intelligent File System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}