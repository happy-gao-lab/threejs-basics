import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Three.js Basics",
  description: "Learning curve of Three.js",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className="h-screen">
      <body className="h-full flex flex-col">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
