"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Beef,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error state
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Touched state for showing errors only after interaction
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateEmail = (value: string) => {
    if (!value) return "E-mail é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido";
    return undefined;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Senha é obrigatória";
    if (value.length < 6) return "Senha deve ter ao menos 6 caracteres";
    return undefined;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);
    toast.loading("Entrando...", { id: "login" });

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await login(formData);

    if (result?.error) {
      toast.error(result.error, { id: "login" });
      setLoading(false);
    } else {
      toast.success("Login realizado com sucesso!", { id: "login" });
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div
            className={cn(
              "transition-all duration-700 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Beef className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gestão Pecuária 360</h1>
                <p className="text-white/70 text-sm">
                  Sistema completo de gestão
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Gerencie seu rebanho
              <br />
              com <span className="text-white/90">inteligência</span>
            </h2>

            <p className="text-white/80 text-lg mb-8 max-w-md">
              Controle sanitário, financeiro e de todo o ciclo de vida dos seus
              animais em um único lugar.
            </p>

            <div className="space-y-4">
              {[
                "Rastreabilidade individual completa",
                "Controle de vacinas automatizado",
                "Gestão financeira detalhada",
              ].map((feature, index) => (
                <div
                  key={feature}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-500",
                    mounted
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-8">
        <div
          className={cn(
            "w-full max-w-md transition-all duration-700 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Beef className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Gestão Pecuária 360
                </h1>
                <p className="text-muted-foreground text-xs">
                  Sistema de gestão
                </p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl shadow-primary/5">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-white shadow-lg">
                    <Sparkles className="h-7 w-7" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Bem-vindo de volta!
              </CardTitle>
              <CardDescription className="text-base">
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-4">
                {/* Email field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={cn(
                      "text-sm font-medium transition-colors",
                      errors.email && touched.email && "text-destructive"
                    )}
                  >
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                        errors.email && touched.email
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={cn(
                        "pl-10 h-12 transition-all duration-200",
                        errors.email && touched.email
                          ? "border-destructive ring-destructive/20 ring-2 bg-destructive/5"
                          : "focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className={cn(
                      "text-sm font-medium transition-colors",
                      errors.password && touched.password && "text-destructive"
                    )}
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                        errors.password && touched.password
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={cn(
                        "pl-10 pr-10 h-12 transition-all duration-200",
                        errors.password && touched.password
                          ? "border-destructive ring-destructive/20 ring-2 bg-destructive/5"
                          : "focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                      <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  className="w-full h-12 text-base font-semibold group relative overflow-hidden"
                  type="submit"
                  disabled={loading}
                >
                  <span
                    className={cn(
                      "flex items-center gap-2 transition-transform duration-200",
                      loading && "translate-y-10"
                    )}
                  >
                    Entrar
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </span>
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      ou
                    </span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Link
                    href="/register"
                    className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
                  >
                    Cadastre-se gratuitamente
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ao entrar, você concorda com nossos{" "}
            <Link
              href="#"
              className="underline hover:text-foreground transition-colors"
            >
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link
              href="#"
              className="underline hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
