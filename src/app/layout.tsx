import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  title: "Splitsies - Split Bills Easily with AI",
  description:
    "AI-powered bill splitting app using Google Gemini. Split restaurant bills, receipts, and expenses fairly among friends with smart OCR technology.",
  keywords: [
    "bill split",
    "receipt scanner",
    "expense sharing",
    "AI",
    "Gemini",
    "split bill",
    "restaurant",
  ],
  authors: [{ name: "Splitsies" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Splitsies",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Splitsies - Split Bills Easily",
    description: "AI-powered bill splitting made simple",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              className:
                "!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
