'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react"; 
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const LoginSchema = z.object({
  username: z.string().min(1, "O nome de utilizador é obrigatório."),
  password: z.string().min(1, "A password é obrigatória."),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
    const { login } = useAuth(); 
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null); 

    const form = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginValues) {
        setAuthError(null); 
    
        const success = await login(values); 
        
        if (success) {
            router.push('/admin/dashboard');
        } else {
            setAuthError("Credenciais inválidas. Por favor, tente novamente.");
        }
    }

    return (
        <main className="flex-1 py-20 flex justify-center items-center bg-muted/40">
            <Card className="w-full max-w-sm shadow-xl">
                <CardHeader className="space-y-1 relative pt-6 px-6 pb-4"> 
                    
                    <Link href="/" passHref className="absolute top-6 left-6">
                        <Button variant="ghost" size="icon" title="Voltar à página inicial">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>

                    <div className="flex flex-col items-center justify-center">
                        <CardTitle className="text-2xl text-center">
                            Login Administrativo
                        </CardTitle>
                    </div>

                    <CardDescription className="text-center pt-2">
                        Utilize as suas credenciais de administrador.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Utilizador</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome de utilizador" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Sua password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "A Autenticar..." : "Entrar"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    );
}