import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({ weight: "400" });
export const metadata: Metadata = {
  title: {
    template: "%s • FolderHarbor Web",
    default: "FolderHarbor Web"
  },
  description: "The web panel for your FolderHarbor server.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lato.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
