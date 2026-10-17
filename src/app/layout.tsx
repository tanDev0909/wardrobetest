import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WardrobeProvider } from "@/lib/store";
import AppNav from "@/components/nav/AppNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ashi's Wardrobe",
  description:
    "A visual digital wardrobe with AI-suggested, weather-aware outfits built from clothes you already own.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Ashi's Wardrobe", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="text-ink">
        <WardrobeProvider>
          <div className="app-shell mx-auto flex min-h-dvh w-full max-w-6xl md:my-6 md:h-[calc(100dvh_-_3rem)] md:min-h-0 md:overflow-hidden md:rounded-[28px]">
            <AppNav />
            <main className="min-w-0 flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8 md:overflow-y-auto">
              {children}
            </main>
          </div>
        </WardrobeProvider>
      </body>
    </html>
  );
}
