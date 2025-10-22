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

const ContactFormSchema = z.object({
    name: z.string().min(2, "O nome é obrigatório."),
    email: z.string().email("Por favor, insira um email válido."),
    subject: z.string().max(255, "O assunto é muito longo.").optional(),
    message: z.string().min(1, "A mensagem é obrigatória."), 
    phone_number: z.string().optional(), 
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
    
  const contactData = {
      phone: "918 630 374", 
      email: "velozconquista@gmail.com",
      adress1: "Estrada De Sta Eulalia 1",
      adress2: "Ponte Lousa",
      facebook: "https://www.facebook.com/velozconquistalda",
      instagram: "https://www.instagram.com/velozconquista/",
  }

  const form = useForm<ContactFormValues>({
      resolver: zodResolver(ContactFormSchema),
      defaultValues: {
          name: "",
          email: "",
          subject: "",
          message: "",
      },
  });

  function onSubmit(values: ContactFormValues) {
      console.log("Formulário Submetido:", values);
      setSubmitted(true);
      form.reset();
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
                <h2 className="text-2xl font-semibold mb-2 border-b-2 border-red-600 inline-block pb-1">
                  Ligue ou Visite
                </h2>
                
                <div className="flex items-center space-x-3 text-lg">
                  <Phone className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-foreground">
                    {contactData.phone}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-lg">
                  <Mail className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-foreground">
                    {contactData.email}
                  </span>
                </div>
                
                <div className="flex space-x-3 text-lg items-start">
                  <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                  <address className="not-italic flex flex-col">
                    <span className="text-foreground">{contactData.adress1}</span>
                    <span className="text-foreground">{contactData.adress2}</span>
                  </address>
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-4">
                <Link 
                  href={contactData.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-foreground hover:text-red-600 transition-colors"
                >
                  <Facebook className="h-7 w-7" />
                </Link>
                <Link 
                  href={contactData.instagram} 
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
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Nome *" {...field} />
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
                              <Input placeholder="Email *" type="email" {...field} />
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
                      
                      <div className="flex justify-between items-center pt-2">
                        <Button 
                          type="submit" 
                          className="bg-red-600 hover:bg-red-700 text-white transition-all w-fit"
                          disabled={form.formState.isSubmitting}
                        >
                          {"Enviar"}
                        </Button>

                        {submitted && (
                            <p className="text-sm text-green-600">
                                Obrigado pela sua mensagem.<br />Responderemos assim que possível.
                            </p>
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