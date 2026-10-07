import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Manish Shrestha — Creative Technologist",
    template: "%s | Manish Shrestha",
  },
  description:
    "Immersive developer portfolio of Manish Shrestha — creative technologist engineering high-performance experiences across the web and native: WebGL, Next.js, React Native, and real-time systems.",
  keywords: [
    "Manish Shrestha",
    "creative technologist",
    "frontend engineer",
    "WebGL",
    "Three.js",
    "React Three Fiber",
    "Next.js",
    "React Native",
    "portfolio",
  ],
  authors: [{ name: "Manish Shrestha" }],
  openGraph: {
    title: "Manish Shrestha — Creative Technologist",
    description:
      "An out-of-this-world portfolio: interactive 3D, scroll choreography, synthesised audio — and the engineering behind it.",
    type: "website",
    siteName: "Manish Shrestha — Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manish Shrestha — Creative Technologist",
    description:
      "Interactive 3D, scroll choreography, synthesised audio — and the engineering behind it.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-dimension="graphite"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-svh bg-void font-sans text-ink">{children}</body>
    </html>
  );
}
