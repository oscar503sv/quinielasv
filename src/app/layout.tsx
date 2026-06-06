import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s · Quiniela 2026",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Quiniela 2026",
  keywords: [
    "quiniela",
    "quiniela mundial 2026",
    "mundial 2026",
    "FIFA",
    "pronósticos",
    "fútbol",
    "polla mundialista",
  ],
  authors: [{ name: "Oscar Aragón" }],
  creator: "Oscar Aragón",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/quinielasv-logo.png",
        width: 500,
        height: 500,
        alt: "Quiniela Mundial 2026",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/quinielasv-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a1830" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7fc" },
  ],
};

// Evita el flash de tema incorrecto: setea data-theme antes de pintar.
const themeScript = `(function(){try{var t=localStorage.getItem('q26_theme')||'dark';document.documentElement.setAttribute('data-theme',t);var a=localStorage.getItem('q26_accent');if(a&&a!=='dorado')document.documentElement.setAttribute('data-accent',a);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
