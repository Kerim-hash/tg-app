import type { Metadata } from "next";
import { Onest, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Telegram Mini App",
  description: "Получение данных пользователя в Telegram Mini App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${onest.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={onest.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
