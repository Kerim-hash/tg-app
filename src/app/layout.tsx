"use client";

import "./globals.css";
import { SDKProvider } from "@tma.js/sdk-react";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SDKProvider>{children}</SDKProvider>
      </body>
    </html>
  );
}
