import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {

  return (
    <main className="flex-1 py-16">
      <div className="w-[70vw] mx-auto space-y-12">
        
        <h1 className="text-4xl font-bold tracking-tight border-b-2 border-red-600 inline-block pb-1">
          Sobre Nós
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-6 text-lg text-foreground">
            <p>"A Veloz Conquista é uma empresa do setor automóvel, especializada no comércio de viaturas semi-novas e usadas.</p>
            <p>"Com sede na Ponte de Lousa, em Loures, a Veloz Conquista conta com profissionais com elevado know-how da área de negócio, oferecendo propostas de valor competitivas, bem como a possibilidade de financiamento e todo o apoio na sua intermediação.</p>
            
            <Card className="p-4 shadow-sm bg-card/70 border-l-4 border-red-600 mt-6">
                <CardContent className="p-0 flex items-center gap-4">
                    <Image
                        src="/logo.png"
                        width={60}
                        height={60}
                        alt="logo"
                        className="rounded-full shrink-0"
                    />
                    <div className="text-sm">
                        <p className="font-semibold text-red-600">A sua Conquista Começa Aqui.</p>
                        <p className="text-muted-foreground">Especialistas em financiamento e intermediação.</p>
                    </div>
                </CardContent>
            </Card>
          </div>
          
          <div className="order-first md:order-last">
            <Image
              src="/placeholder.svg?height=400&width=600&text=Stand+Veloz+Conquista" 
              width={600}
              height={400}
              alt="Vista da Concessionária Veloz Conquista em Ponte de Lousa"
              className="w-full h-auto rounded-xl object-cover shadow-lg"
            />
          </div>
        </div>

        <div className="pt-12 border-t border-border/50">
          
          <div className="max-w-3xl mx-auto"> 

            <h2 className="text-xl font-semibold mb-4 text-center text-red-600">
              INFORMAÇÃO RELATIVA À ATIVIDADE DE INTERMEDIÁRIO DE CRÉDITO
            </h2>
            <div className="text-sm text-foreground space-y-4">
              
              <p className="text-center font-semibold">
                VELOZCONQUISTA UNIPESSOAL LDA REGISTADA NA CATEGORIA DE INTERMEDIÁRIO DE CRÉDITO A TÍTULO ACESSÓRIO SOB O N 0001893
              </p>

              <div className="space-y-2">
                  <p className="font-medium">
                      REGISTO DISPONÍVEL PARA CONSULTA NO PORTAL DO CLIENTE BANCÁRIO EM:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground">
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
              
              <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-12 pt-2 text-center text-sm font-medium">
                  <p className="text-red-600">
                      TELEFONE: <span className="text-foreground">932 872 422</span>
                  </p>
                  <p className="text-red-600">
                      EMAIL: <span className="text-foreground">VELOZCONQUISTA@GMAIL.COM</span>
                  </p>
              </div>
              
              <p className="text-center font-medium">
                  SEDE: ESTRADA DE SANTA EULALIA 1, PONTE DE LOUSA, 2670-351 LOURES
              </p>

              <div className="space-y-2 pt-4">
                  <p className="font-medium text-red-600">MUTUANTES COM QUEM MANTÉM CONTRATO DE VINCULAÇÃO:</p>
                  <ul className="list-disc list-inside pl-4 text-muted-foreground">
                      <li>321 CREDITO INST.FINANCEIRA DE CREDITO, SA</li>
                      <li>COFIDIS</li>
                      <li>BANCO INVEST S.A</li>
                  </ul>
              </div>

              <div className="space-y-2 pt-4">
                  <p className="font-medium text-red-600">SERVIÇOS QUE PRESTA NA INTERMEDIAÇÃO DE CRÉDITO:</p>
                  <ul className="list-disc list-inside pl-4 text-muted-foreground">
                      <li>APRESENTAÇÃO OU PROPOSTA DE CONTRATOS DE CRÉDITO A CONSUMIDORES;</li>
                  </ul>
              </div>

              <div className="space-y-1 pt-4 text-center">
                  <p>
                      CONTRATO DE SEGURO DE RESPONSABILIDADE CIVIL PROFISSIONAL CELEBRADO COM COMPANHIA SEGUROS TRANQUILIDADE
                  </p>
                  <p className="font-semibold text-red-600">
                      APÓLICE Nº 005174616 — VÁLIDO ATÉ 21-09-2021
                  </p>
              </div>

              <p className="pt-4 text-sm text-justify">
                  O INTERMEDIÁRIO DE CRÉDITO VELOZCONQUISTA UNIPESSOAL LDA NÃO PODE RECEBER OU ENTREGAR QUAISQUER VALORES RELACIONADOS COM A FORMAÇÃO, A EXECUÇÃO E O CUMPRIMENTO ANTECIPADO DOS CONTRATOS DE CRÉDITO, NOS TERMOS DO ARTIGO 46º DO DECRETO-LEI 81-C/2017, DE 07/07.
              </p>

              <p className="pt-2 text-sm font-semibold text-red-600 text-center">
                  A ATIVIDADE DE INTERMEDIÁRIO DE CRÉDITO DA VELOZCONQUISTA UNIPESSOAL LDA ESTÁ SUJEITA À SUPERVISÃO DO BANCO DE PORTUGAL
              </p>
            </div>
          
            <p className="pt-4 text-xs text-muted-foreground text-center italic">
              Informação prestada em conformidade com o nº 1 do artigo 53.º do Decreto-Lei 81-C/2017, de 07 de julho.
            </p>

          </div> 
        </div>
      </div>
    </main>
  );
}