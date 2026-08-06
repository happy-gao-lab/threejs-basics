import type { Metadata } from "next";
import "./globals.css";
import FloatingHomeButton from "@/components/floating-home-button";

export const metadata: Metadata = {
  title: "Three.js Basics",
  description: "Learning curve of Three.js",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className="h-screen">
      <body className="h-full flex flex-col">
        <main className="flex-1">{children}</main>
        <FloatingHomeButton />
      </body>
    </html>
  );
};

// http://localhost:3000/threejs-basics/

export default RootLayout;
