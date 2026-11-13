import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PERINTIS",
  description: "Personal Growth Guidance Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
