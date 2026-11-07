import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata = {
  title: "ShowTime — Tiket Konser Resmi",
  description:
    "Temukan konser & festival musik terbaik. Beli tiket resmi dengan mudah, cepat, dan aman.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
