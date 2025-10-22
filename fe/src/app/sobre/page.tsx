import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {

  return (
    <main className="flex-1 py-16">
      <div className="w-[70vw] mx-auto space-y-12">
        
        <div className="max-w-4xl mx-auto space-y-8"> 
            <h1 className="text-4xl font-bold tracking-tight border-b-2 border-red-600 inline-block pb-1">
              Sobre Nós
            </h1>

            <div className="space-y-6 text-lg text-foreground">
                <p>A Veloz Conquista é uma empresa do setor automóvel, especializada no comércio de viaturas semi-novas e usadas.</p>
                <p>Com sede na Ponte de Lousa, em Loures, a Veloz Conquista conta com profissionais com elevado know-how da área de negócio, oferecendo propostas de valor competitivas, bem como a possibilidade de financiamento e todo o apoio na sua intermediação.</p>
                
                <Card className="p-4 shadow-sm bg-card/70 border-l-4 border-red-600 mt-6">
                    <CardContent className="p-0 flex items-center gap-4">
                        <Image
                            src="/images.png" 
                            width={60}
                            height={60}
                            alt="Logo Veloz Conquista"
                            className="rounded-full shrink-0"
                        />
                        <div className="text-sm">
                            <p className="font-semibold text-red-600">A sua Conquista Começa Aqui.</p>
                            <p className="text-muted-foreground">Especialistas em financiamento e intermediação.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="pt-12 border-t border-border/50">
          
          <div className="max-w-3xl mx-auto space-y-4 text-center"> 
            
            <h2 className="text-xl font-semibold text-red-600">
              INFORMAÇÃO RELATIVA À ATIVIDADE DE INTERMEDIÁRIO DE CRÉDITO
            </h2>
            
            <p className="font-semibold">
              VELOZCONQUISTA UNIPESSOAL LDA REGISTADA NA CATEGORIA DE INTERMEDIÁRIO DE CRÉDITO A TÍTULO ACESSÓRIO SOB O N 0001893
            </p>

            <div className="pt-2">
                <p className="font-medium text-foreground">
                    REGISTO DISPONÍVEL PARA CONSULTA NO PORTAL DO CLIENTE BANCÁRIO EM:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-4 w-fit mx-auto text-muted-foreground">
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
                        TELEFONE: <span className="text-foreground">932 872 422</span>
                    </p>
                    <p className="text-red-600">
                        EMAIL: <span className="text-foreground">VELOZCONQUISTA@GMAIL.COM</span>
                    </p>
                </div>
                <p className="font-medium pt-1">
                    SEDE: ESTRADA DE SANTA EULALIA 1, PONTE DE LOUSA, 2670-351 LOURES
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
                    CONTRATO DE SEGURO DE RESPONSABILIDADE CIVIL PROFISSIONAL CELEBRADO COM COMPANHIA SEGUROS TRANQUILIDADE
                </p>
                <p className="font-semibold text-red-600">
                    APÓLICE Nº 005174616 — VÁLIDO ATÉ 21-09-2021
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
    </main>
  );
}