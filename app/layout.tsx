import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./components/auth-provider";
import BottomBarWrapper from "./components/bottombar-wrapper";

export const metadata: Metadata = { 
  title: "UniTok",
  description: "AUB Campus Reviews"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Removed the hardcoded dark theme so the Provider can control it
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
        <AuthProvider>
          {children}
          <BottomBarWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}