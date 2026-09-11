import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "قدراتك | Qudratak — منصة تدريب اختبار القدرات العامة",
  description:
    "منصة سعودية متكاملة للتدريب على اختبار القدرات العامة (قياس): بنك أسئلة ضخم، اختبارات محاكاة، تحليل أداء، نقاشات تعليمية، ومساعد ذكي.",
  keywords: ["قدرات", "قياس", "GAT", "اختبار القدرات", "قدراتك", "تدريب", "السعودية"],
  authors: [{ name: "قدراتك" }],
  openGraph: {
    title: "قدراتك | Qudratak",
    description: "تدرّب، حلّل، وتفوّق في اختبار القدرات العامة",
    siteName: "قدراتك",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
        <Toaster />
        <Sonner position="top-center" richColors />
      </body>
    </html>
  );
}
