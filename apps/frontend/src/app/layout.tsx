import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Intelligence | Overview",
  description: "Marketing intelligence for D2C brands and agencies in India. Foundation preview.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>;
}
