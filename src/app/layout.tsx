import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Finance Planner - Global Financial Planning",
  description: "Plan your finances globally with real-time currency conversion and location-based cost adjustments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
