import { Header } from "@/components/app/header";
import { Footer } from "@/components/app/footer";
import { JsonLd } from "@/components/app/JsonLd";
import { getCompany } from "@/lib/api-server";
import { autoDealerJsonLd } from "@/lib/seo";

export default async function FrontOfficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const company = await getCompany();

  return (
    <>
      <JsonLd data={autoDealerJsonLd(company)} />
      <Header />
        <main className="flex-1">
          {children}
        </main>
      <Footer company={company} />
    </>
  );
}
