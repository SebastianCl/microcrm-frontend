
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import { authService } from "@/services/authService";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor introduce un correo electrónico válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Intento de inicio de sesión:", values);
    
    try {
      // Usar el servicio de autenticación para hacer el login
      const response = await authService.login(values.email, values.password);
      
      // Verificar si se recibió el token
      if (!response || !response.token) {
        throw new Error('No se recibió un token válido');
      }
      
      // Guardar el token en localStorage
      localStorage.setItem('authToken', response.token);
      
      // Determinar el rol basado en la respuesta o usar un valor por defecto
      const role = values.email.includes('admin') ? 'Administrator' : 'Collaborator';
      
      // Usar la función de login del contexto de autenticación
      login({ 
        email: values.email, 
        role: role
      });
      
      toast.success("Inicio de sesión exitoso", {
        description: "¡Bienvenido de nuevo!",
      });
      
      // Redireccionar a la página anterior o a la ruta por defecto
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      toast.error("Error de inicio de sesión", {
        description: "Correo electrónico o contraseña inválidos",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <CardTitle className="text-3xl font-bold">Iniciar sesión</CardTitle>
          <CardDescription>Introduce tu correo electrónico y contraseña para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="tu@ejemplo.com" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
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
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Iniciar sesión</Button>
            </form>
          </Form>
        </CardContent>        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground mt-2">
            <p>Ingrese sus credenciales para acceder</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
