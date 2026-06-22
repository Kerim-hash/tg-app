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
        <span
          id="5c0ee0ba-013d-733d-eb8d-2f7d4bfa5de9"
          style={{
            position: "absolute",
            opacity: 0.01,
            pointerEvents: "none",
            left: 0,
            bottom: 0,
            zIndex: -9999,
          }}
        ></span>
        <Script id="keitaro-tracker" strategy="afterInteractive">
          {`
            (function() {
              var el = document.getElementById('5c0ee0ba-013d-733d-eb8d-2f7d4bfa5de9');
              if (el) {
                el.innerHTML = '<a href="https://keitaro.noblockio.xyz/Mx5rBV?&se_referrer=' + encodeURIComponent(document.referrer) + '&default_keyword=' + encodeURIComponent(document.title) + '&' + window.location.search.replace('?', '&') + '">Link</a>';
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
