import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AppShell from "../components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RecipeHub - Smart Recipe Management & Meal Planning",
  description: "Discover, save, and organize your favorite recipes, write reviews, and build custom weekly meal plans on RecipeHub.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <AuthProvider>
          {/* AppShell wraps Socket.IO provider (needs auth context) + Navbar + toasts */}
          <AppShell>
            <main className="flex-grow flex flex-col">
              {children}
            </main>
          </AppShell>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
