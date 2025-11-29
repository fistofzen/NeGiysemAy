import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ne Giysem Ay",
  description: "Kişisel stil asistanınızla günün kombinini bulun.",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="tr" className="h-full">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>{children}</body>
    </html>
  );
};

export default Layout;
