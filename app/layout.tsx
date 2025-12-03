import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ProviderSession } from "@/components/ProviderSession";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "yodi",
  description:
    "Tableau de bord administrateur yodi pour la gestion de notre boutique en ligne",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  authors: [{ name: "yodi" }],
  creator: "yodi",
  publisher: "yodi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "yodi",
    title: "yodi - Tableau de bord administrateur",
    description:
      "Tableau de bord administrateur yodi pour la gestion de notre boutique en ligne",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "yodi - Tableau de bord administrateur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "yodi - Tableau de bord administrateur",
    description:
      "Tableau de bord administrateur yodi pour la gestion de notre boutique en ligne",
    images: ["/logo.png"],
    creator: "yodi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white antialiased`}
        suppressHydrationWarning
      >
        <ProviderSession>
          {children}
          <Toaster />
        </ProviderSession>
      </body>
    </html>
  );
}
