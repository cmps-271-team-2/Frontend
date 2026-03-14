import type { Metadata } from "next";
import ThemeToggle from "./components/theme-toggle";
import BottomBarWrapper from "./components/bottombar-wrapper";
import "./globals.css";

export const metadata: Metadata = { title: "UniTok" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body style={{ margin: 0 }}>
        <ThemeToggle />
        {children}
        <BottomBarWrapper />
      </body>
    </html>
  );
}
