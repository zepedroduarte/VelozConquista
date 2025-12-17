import { Header } from "@/components/app/header";
import { Footer } from "@/components/app/footer";

export default function FrontOfficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
        <main className="flex-1">
          {children}
        </main>
      <Footer />
    </>
  );
}