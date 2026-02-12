import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wipeout Tracker",
  description: "Days since last snowboarding wipeout",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
