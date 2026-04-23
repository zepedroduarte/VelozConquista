'use client'

import Link from "next/link";
import { useCompany } from "@/context/CompanyContext";

export default function About() {

    const { company } = useCompany();

    return (
        <main className="flex-1 py-16">
        <div className="w-[70vw] mx-auto space-y-12">
            
            <div className="max-w-4xl mx-auto space-y-8"> 
                <h1 className="text-4xl font-bold tracking-tight border-b-2 border-red-600 inline-block pb-1">
                Sobre Nós
                </h1>

                <div className="space-y-6 text-lg text-foreground">
                    {company?.description?.split('.').map((sentence, index) => {
                        const cleanSentence = sentence.trim();
                        
                        if (!cleanSentence) return null;

                        return (
                            <p key={index}>
                                {cleanSentence}.
                            </p>
                        );
                    })}
                </div>
            </div>

            <div className="pt-12 border-t border-border/50">
            
            <div className="max-w-3xl mx-auto space-y-4 text-center"> 
                
                <h2 className="text-xl font-semibold text-red-600">
                INFORMAÇÃO RELATIVA À ATIVIDADE DE INTERMEDIÁRIO DE CRÉDITO
                </h2>
                
                <div className="text-sm text-foreground space-y-4">
                
                <p className="font-semibold">
                    VELOZCONQUISTA UNIPESSOAL LDA REGISTADA NA CATEGORIA DE INTERMEDIÁRIO DE CRÉDITO A TÍTULO ACESSÓRIO SOB O N 0001893
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
                                className="hover:underline text-primary"
                            >
                                https://www.bportugal.pt/intermediariocreditovalidar-registo
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
                        <li>321 CREDITO INST.FINANCEIRA DE CREDITO, SA</li>
                        <li>COFIDIS</li>
                        <li>BANCO INVEST S.A</li>
                    </ul>
                </div>

                <div className="space-y-2 pt-4 text-left w-fit mx-auto">
                    <p className="font-medium text-red-600">SERVIÇOS QUE PRESTA NA INTERMEDIAÇÃO DE CRÉDITO:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                        <li>APRESENTAÇÃO OU PROPOSTA DE CONTRATOS DE CRÉDITO A CONSUMIDORES;</li>
                    </ul>
                </div>

                <div className="space-y-1 pt-4">
                    <p className="text-sm">
                        CONTRATO DE SEGURO DE RESPONSABILIDADE CIVIL PROFISSIONAL CELEBRADO COM COMPANHIA SEGUROS AGEAS
                    </p>
                    <p className="font-semibold text-red-600">
                        APÓLICE Nº 00841023353700000 — VÁLIDO DE 22-03-2026 A 21-06-2026
                    </p>
                </div>

                <p className="pt-4 text-sm text-justify">
                    O INTERMEDIÁRIO DE CRÉDITO VELOZCONQUISTA UNIPESSOAL LDA NÃO PODE RECEBER OU ENTREGAR QUAISQUER VALORES RELACIONADOS COM A FORMAÇÃO, A EXECUÇÃO E O CUMPRIMENTO ANTECIPADO DOS CONTRATOS DE CRÉDITO, NOS TERMOS DO ARTIGO 46º DO DECRETO-LEI 81-C/2017, DE 07/07.
                </p>

                <p className="pt-2 text-sm font-semibold text-red-600">
                    A ATIVIDADE DE INTERMEDIÁRIO DE CRÉDITO DA VELOZCONQUISTA UNIPESSOAL LDA ESTÁ SUJEITA À SUPERVISÃO DO BANCO DE PORTUGAL
                </p>
                
                <p className="pt-4 text-xs text-muted-foreground italic">
                    Informação prestada em conformidade com o nº 1 do artigo 53.º do Decreto-Lei 81-C/2017, de 07 de julho.
                </p>

                </div> 
            </div> 
            </div>
        </div>
        </main>
  );
}