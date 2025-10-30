// fe/src/app/login/page.tsx
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import "../globals.css";
import axios from 'axios';
import { useAuth } from "@/context/AuthContext";

const LoginSchema = z.object({
  username: z.string().min(1, "O nome de utilizador é obrigatório."),
  password: z.string().min(1, "A password é obrigatória."),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const form = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginValues) {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login/`, values, {
                withCredentials: true,
            });
            
            login(); 
            
            router.push('/admin/dashboard');

        } catch (error) {
            console.error("Falha na autenticação:", error);
        }
    }

    return (
        <html>
            <body>
                <main className="flex-1 py-20 flex justify-center items-center bg-muted/40">
                    <Card className="w-full max-w-sm shadow-xl">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center">Login Administrativo</CardTitle>
                            <CardDescription className="text-center">
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
            </body>
        </html>
    );
}