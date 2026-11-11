import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/chat/ChatWidget";
import ToastHost from "@/components/ToastHost";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "IVAN — Not Made To Fit In",
  description: "Custom art. Street culture. Individual expression. IVAN Lagos.",
};

// Applies the saved theme before the first paint so there is no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('ivan-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${space.variable} ${inter.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}<ChatWidget /><ToastHost /></body>
    </html>
  );
}
