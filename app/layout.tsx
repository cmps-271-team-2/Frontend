import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { 
  title: "UniTok",
  description: "AUB Campus Reviews"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Removed the hardcoded dark theme so the Provider can control it
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}