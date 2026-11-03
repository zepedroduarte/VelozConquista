'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react"; 
import { isAxiosError } from "axios";
import { useCompany } from "@/context/CompanyContext";
import api from "@/lib/axios";

const ContactFormSchema = z.object({
    name: z.string().min(2, "O nome é obrigatório."),
    email: z.string().email("Por favor, insira um email válido."),
    subject: z.string().min(1, "O assunto é obrigatório."), 
    message: z.string().min(1, "A mensagem é obrigatória."), 
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // Honeypot: campo escondido que só robôs de spam preenchem
  const [website, setWebsite] = useState("");

  const { company } = useCompany();
    
  const form = useForm<ContactFormValues>({
      resolver: zodResolver(ContactFormSchema),
      defaultValues: {
          name: "",
          email: "",
          subject: "",
          message: "",
      },
  });

  async function onSubmit(values: ContactFormValues) {
      try {
          setSendError(null);
          const payload = {
              website,
              sender_name: values.name,
              sender_email: values.email,
              subject: values.subject,
              body: values.message,
          };

          await api.post('/messages/', payload);
          
          setSubmitted(true);
          form.reset();


      } catch (error) {
          console.error("Erro ao enviar mensagem:", error);
          const tooMany = isAxiosError(error) && error.response?.status === 429;
          setSendError(tooMany
              ? "Foram enviadas demasiadas mensagens. Tente mais tarde ou contacte-nos por telefone."
              : "Não foi possível enviar a mensagem. Tente novamente ou contacte-nos por telefone.");
      }
  }

  return (
    <>
      <main className="flex-1 py-16">
        <div className="w-[70vw] mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-8">
            Contactos
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="space-y-4">          
                
                <div className="flex items-center space-x-3 text-lg">
                  <Phone className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-foreground">
                    {company?.phone} <span className="italic">(Chamada para rede móvel nacional)</span>
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-lg">
                  <Mail className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-foreground">
                    {company?.email}
                  </span>
                </div>
                
                <div className="flex space-x-3 text-lg items-start">
                  <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                  <address className="not-italic flex flex-col">
                    <span className="text-foreground">{company?.address}</span>
                  </address>
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-4">
                <Link 
                  href={company?.facebook_url || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-foreground hover:text-red-600 transition-colors"
                >
                  <Facebook className="h-7 w-7" />
                </Link>
                <Link 
                  href={company?.instagram_url || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-foreground hover:text-red-600 transition-colors"
                >
                  <Instagram className="h-7 w-7" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Envie-nos uma Mensagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                        <label htmlFor="website">Não preencher</label>
                        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              {/* Removido o * do placeholder */}
                              <Input placeholder="Nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Assunto" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea placeholder="Mensagem" rows={5} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <p className="text-sm text-muted-foreground pt-1">
                        Todos os campos são obrigatórios.
                      </p>

                      {sendError && <p role="alert" className="text-sm text-red-600">{sendError}</p>}

                      <div className="flex justify-end items-center pt-2">                                       
                        {submitted ? (
                          <p className="text-sm text-green-600 ml-4">
                              Obrigado pela sua mensagem.<br />Responderemos assim que possível.
                          </p>
                        ) : (
                          <Button 
                            type="submit" 
                            className="bg-red-600 hover:bg-red-700 text-white transition-all w-fit"
                            disabled={form.formState.isSubmitting}
                          >
                            {form.formState.isSubmitting ? "A Enviar..." : "Enviar"}
                          </Button>
                        )}                        
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}