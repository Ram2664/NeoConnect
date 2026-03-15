import "./globals.css";

export const metadata = {
  title: "NeoConnect",
  description: "Staff feedback and complaint management system"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
