import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Streaming Player",
  description: "A demonstration of token-based protection for media streaming",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favi.png" type="image/png" sizes="16x16" />
      </head>
      <body className="min-h-screen bg-black text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
