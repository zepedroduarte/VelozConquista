import type { Metadata } from "next";
import Link from "next/link";
import { getCompany, getLegalInfo } from "@/lib/api-server";

export const metadata: Metadata = {
    title: "Sobre Nós | Veloz Conquista",
    description: "Conheça a Veloz Conquista, comércio de automóveis usados e semi-novos e intermediário de crédito registado no Banco de Portugal.",
};

// Texto editado no back-office: cada linha é um parágrafo.
// (Textos antigos escritos numa só linha continuam a ser divididos por frases.)
function toParagraphs(text?: string): string[] {
    if (!text) return [];
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) return lines;
    return text.split('.').map((s) => s.trim()).filter(Boolean).map((s) => `${s}.`);
}

const toList = (text?: string) => (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
}

export default async function About() {

    const [company, legal] = await Promise.all([getCompany(), getLegalInfo()]);

    return (
        <main className="flex-1 py-16">
        <div className="w-[70vw] mx-auto space-y-12">

            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold tracking-tight border-b-2 border-red-600 inline-block pb-1">
                Sobre Nós
                </h1>

                <div className="space-y-6 text-lg text-foreground">
                    {toParagraphs(company?.description).map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </div>

            {legal && (
            <div className="pt-12 border-t border-border/50">

            <div className="max-w-3xl mx-auto space-y-4 text-center">

                <h2 className="text-xl font-semibold text-red-600">
                INFORMAÇÃO RELATIVA À ATIVIDADE DE INTERMEDIÁRIO DE CRÉDITO
                </h2>

                <div className="text-sm text-foreground space-y-4">

                <p className="font-semibold">
                    {legal.legal_name} REGISTADA NA CATEGORIA DE INTERMEDIÁRIO DE CRÉDITO A TÍTULO ACESSÓRIO SOB O N {legal.credit_intermediary_number}
                </p>

                <div className="pt-2 text-left">
                    <p className="font-medium text-foreground text-center">
                        REGISTO DISPONÍVEL PARA CONSULTA NO PORTAL DO CLIENTE BANCÁRIO EM:
                    </p>
                    <ul className="space-y-1 pl-4 mx-auto text-muted-foreground w-fit">
                        <li>
                            <Link
                                href="https://www.bportugal.pt/intermediariocreditovalidar-registo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-primary break-all"
                            >
                                https://www.bportugal.pt/intermediariocreditovalidar-registo
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://clientebancario.bportugal.pt/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-primary break-all"
                            >
                                https://clientebancario.bportugal.pt/
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="pt-4 space-y-1">
                    <div className="flex justify-center flex-wrap gap-x-8 gap-y-1 text-sm font-medium">
                        <p className="text-red-600">
                            TELEFONE: <span className="text-foreground">{company?.phone}</span>
                        </p>
                        <p className="text-red-600">
                            EMAIL: <span className="text-foreground">{company?.email}</span>
                        </p>
                    </div>
                    <p className="font-medium pt-1">
                        <span className="text-foreground"> {company?.address}</span>
                    </p>
                </div>

                <div className="space-y-2 pt-4 text-left w-fit mx-auto">
                    <p className="font-medium text-red-600">MUTUANTES COM QUEM MANTÉM CONTRATO DE VINCULAÇÃO:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {toList(legal.lenders).map((lender) => <li key={lender}>{lender}</li>)}
                    </ul>
                </div>

                <div className="space-y-2 pt-4 text-left w-fit mx-auto">
                    <p className="font-medium text-red-600">SERVIÇOS QUE PRESTA NA INTERMEDIAÇÃO DE CRÉDITO:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {toList(legal.services).map((service) => <li key={service}>{service}</li>)}
                    </ul>
                </div>

                <div className="space-y-1 pt-4">
                    <p className="text-sm">
                        CONTRATO DE SEGURO DE RESPONSABILIDADE CIVIL PROFISSIONAL CELEBRADO COM {legal.insurer}
                    </p>
                    <p className="font-semibold text-red-600">
                        APÓLICE Nº {legal.insurance_policy_number} — VÁLIDO DE {formatDate(legal.insurance_valid_from)} A {formatDate(legal.insurance_valid_until)}
                    </p>
                </div>

                <div className="pt-4 text-left space-y-3 text-sm text-justify">
                    <p>
                        <span className="font-semibold">É proibido</span> ao intermediário de crédito receber ou entregar quaisquer valores relacionados com a formação, a execução e o cumprimento antecipado dos contratos de crédito, nos termos do artigo 46.º do regime jurídico dos intermediários de crédito, aprovado pelo Decreto-Lei n.º 81-C/2017, de 7 de julho.
                    </p>
                    <p>
                        O intermediário de crédito atua sob nome e responsabilidade dos mutuantes com quem mantém vínculo.
                    </p>
                </div>

                <p className="pt-2 text-sm font-semibold text-red-600">
                    A ATIVIDADE DE INTERMEDIÁRIO DE CRÉDITO DA {legal.legal_name} ESTÁ SUJEITA À SUPERVISÃO DO BANCO DE PORTUGAL
                </p>

                <p className="pt-4 text-xs text-muted-foreground italic">
                    Informação prestada em conformidade com o nº 1 do artigo 53.º do Decreto-Lei 81-C/2017, de 07 de julho.
                </p>

                </div>
            </div>
            </div>
            )}
        </div>
        </main>
  );
}
