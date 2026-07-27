import type { Metadata } from "next";
// @ts-expect-error - Next handles global CSS imports at build time.
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "VisionCart — Shop in AR",
  description: "Try products in your space before you buy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Plain <script> avoids Next's preload warnings. The web component
            is registered before the page hydrates, so <model-viewer> works. */}
        <script
          type="module"
          src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
          async
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <ChatBot />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}