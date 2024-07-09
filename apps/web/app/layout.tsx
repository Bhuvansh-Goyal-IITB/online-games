import type { Metadata } from "next";
import { ThemeProvider } from "@repo/ui/components/theme-provider";
import "@repo/ui/globals.css";
import { SessionProvider } from "next-auth/react";
import { inter } from "@/fonts";
import { Toaster } from "@repo/ui/components/ui/sonner";

export const metadata: Metadata = {
  title: "Online Games",
  description: "Play your favourite games with your friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="bg-background" lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
