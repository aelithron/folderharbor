import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Header } from "./(ui)/ui.module";

const lato = Lato({ weight: "400" });
export const metadata: Metadata = {
  title: {
    template: "%s | FolderHarbor",
    default: "FolderHarbor"
  },
  description: "A powerful, multi-protocol, open-source file server.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${lato.className} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
