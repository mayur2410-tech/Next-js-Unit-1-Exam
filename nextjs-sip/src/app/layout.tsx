import type { Metadata } from "next";
import Providers from "./providers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mutual Fund Explorer + SIP Calculator",
  description: "MF Explorer using MFAPI.in with SIP & Returns calculators"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header style={{ padding: "12px 16px", borderBottom: "1px solid #eee", display: "flex", gap: 16 }}>
            <Link href="/funds">Funds</Link>
          </header>
          <main style={{ padding: "16px" }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}