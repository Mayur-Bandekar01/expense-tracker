import type { Metadata } from "next";
import { HunterRootProvider } from "../components/layout/HunterRootProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paisa Pulse — Personal Finance & Expense Tracker",
  description: "Modern, intelligent expense tracking with clean analytics, budgets, and smart financial management.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#f8fafc" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var s = localStorage.getItem('paisa_pulse_theme');
                  var isDark = false;
                  if (s === 'dark') {
                    isDark = true;
                  } else if (s === 'light') {
                    isDark = false;
                  } else {
                    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-base text-text-primary min-h-screen font-sans selection:bg-brand-100 selection:text-brand-900 antialiased">
        <div className="relative flex min-h-screen flex-col">
          <HunterRootProvider>{children}</HunterRootProvider>
        </div>
      </body>
    </html>
  );
}
