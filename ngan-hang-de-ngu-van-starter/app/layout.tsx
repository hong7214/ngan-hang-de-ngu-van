import "./globals.css";

export const metadata = {
  title: "Ngân hàng đề tự luận Ngữ văn",
  description: "Kho đề tự luận Ngữ văn THCS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
