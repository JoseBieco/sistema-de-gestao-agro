"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { signup } from "./actions";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Beef,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  X,
  MailCheck,
  Sparkles,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Password validation rules
const passwordRules = [
  {
    id: "length",
    label: "Mínimo 8 caracteres",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "uppercase",
    label: "1 letra maiúscula",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "1 letra minúscula",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    id: "special",
    label: "1 caractere especial (!@#$%)",
    test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error state
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Touched state
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const passedRules = passwordRules.filter((rule) => rule.test(password));
    return {
      passed: passedRules.length,
      total: passwordRules.length,
      percentage: (passedRules.length / passwordRules.length) * 100,
      rules: passwordRules.map((rule) => ({
        ...rule,
        passed: rule.test(password),
      })),
    };
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength.percentage === 100) return "bg-green-500";
    if (passwordStrength.percentage >= 75) return "bg-yellow-500";
    if (passwordStrength.percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthLabel = () => {
    if (passwordStrength.percentage === 100) return "Forte";
    if (passwordStrength.percentage >= 75) return "Boa";
    if (passwordStrength.percentage >= 50) return "Média";
    if (passwordStrength.percentage > 0) return "Fraca";
    return "";
  };

  // Validators
  const validateName = (value: string) => {
    if (!value.trim()) return "Nome é obrigatório";
    if (value.trim().length < 3) return "Nome deve ter ao menos 3 caracteres";
    return undefined;
  };

  const validateEmail = (value: string) => {
    if (!value) return "E-mail é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido";
    return undefined;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Senha é obrigatória";
    if (passwordStrength.percentage < 100) {
      return "A senha não atende todos os requisitos";
    }
    return undefined;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Confirmação de senha é obrigatória";
    if (value !== password) return "As senhas não coincidem";
    return undefined;
  };

  // Change handlers
  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    }
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
    // Also validate confirm password if it's been touched
    if (touched.confirmPassword && confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          confirmPassword !== value ? "As senhas não coincidem" : undefined,
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value),
      }));
    }
  };

  const handleBlur = (
    field: "name" | "email" | "password" | "confirmPassword"
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    switch (field) {
      case "name":
        setErrors((prev) => ({ ...prev, name: validateName(name) }));
        break;
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(password),
        }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(confirmPassword),
        }));
        break;
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (nameError || emailError || passwordError || confirmPasswordError) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);
    toast.loading("Criando sua conta...", { id: "register" });

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    const result = await signup(formData);

    if (result?.error) {
      toast.error(result.error, { id: "register" });
      setLoading(false);
    } else {
      toast.success("Conta criada com sucesso!", { id: "register" });
      setRegisteredEmail(email);
      setShowEmailDialog(true);
      setLoading(false);
    }
  }

  return (
    <>
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
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
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
                Comece a gerenciar
                <br />
                seu rebanho <span className="text-white/90">hoje</span>
              </h2>

              <p className="text-white/80 text-lg mb-8 max-w-md">
                Crie sua conta gratuita e tenha acesso a todas as ferramentas
                para uma gestão pecuária eficiente.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Seus dados protegidos e seguros" },
                  { icon: Sparkles, text: "Interface moderna e intuitiva" },
                  { icon: MailCheck, text: "Suporte dedicado por e-mail" },
                ].map((feature, index) => (
                  <div
                    key={feature.text}
                    className={cn(
                      "flex items-center gap-3 transition-all duration-500",
                      mounted
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    )}
                    style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                  >
                    <div className="p-2 bg-white/10 rounded-lg">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <span className="text-white/90">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        {/* Right side - Register form */}
        <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-8 overflow-y-auto">
          <div
            className={cn(
              "w-full max-w-md my-8 transition-all duration-700 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-6">
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
                      <User className="h-7 w-7" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  Crie sua conta
                </CardTitle>
                <CardDescription className="text-base">
                  Preencha os dados para começar a usar o sistema
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  {/* Name field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className={cn(
                        "text-sm font-medium transition-colors",
                        errors.name && touched.name && "text-destructive"
                      )}
                    >
                      Nome Completo <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                          errors.name && touched.name
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      />
                      <Input
                        id="name"
                        type="text"
                        placeholder="João Silva"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onBlur={() => handleBlur("name")}
                        className={cn(
                          "pl-10 h-12 transition-all duration-200",
                          errors.name && touched.name
                            ? "border-destructive ring-destructive/20 ring-2 bg-destructive/5"
                            : "focus:ring-2 focus:ring-primary/20"
                        )}
                      />
                    </div>
                    {errors.name && touched.name && (
                      <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                        <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={cn(
                        "text-sm font-medium transition-colors",
                        errors.email && touched.email && "text-destructive"
                      )}
                    >
                      E-mail <span className="text-destructive">*</span>
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
                        errors.password &&
                          touched.password &&
                          "text-destructive"
                      )}
                    >
                      Senha <span className="text-destructive">*</span>
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

                    {/* Password strength indicator */}
                    {password && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-300",
                                getStrengthColor()
                              )}
                              style={{
                                width: `${passwordStrength.percentage}%`,
                              }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              passwordStrength.percentage === 100
                                ? "text-green-600"
                                : passwordStrength.percentage >= 75
                                ? "text-yellow-600"
                                : passwordStrength.percentage >= 50
                                ? "text-orange-600"
                                : "text-red-600"
                            )}
                          >
                            {getStrengthLabel()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {passwordStrength.rules.map((rule) => (
                            <div
                              key={rule.id}
                              className={cn(
                                "flex items-center gap-1.5 text-xs transition-colors",
                                rule.passed
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              )}
                            >
                              {rule.passed ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              {rule.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {errors.password && touched.password && !password && (
                      <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                        <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className={cn(
                        "text-sm font-medium transition-colors",
                        errors.confirmPassword &&
                          touched.confirmPassword &&
                          "text-destructive"
                      )}
                    >
                      Confirmar Senha{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                          errors.confirmPassword && touched.confirmPassword
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) =>
                          handleConfirmPasswordChange(e.target.value)
                        }
                        onBlur={() => handleBlur("confirmPassword")}
                        className={cn(
                          "pl-10 pr-10 h-12 transition-all duration-200",
                          errors.confirmPassword && touched.confirmPassword
                            ? "border-destructive ring-destructive/20 ring-2 bg-destructive/5"
                            : confirmPassword && confirmPassword === password
                            ? "border-green-500 ring-green-500/20 ring-2"
                            : "focus:ring-2 focus:ring-primary/20"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                        <span className="inline-block w-1 h-1 bg-destructive rounded-full" />
                        {errors.confirmPassword}
                      </p>
                    )}
                    {confirmPassword &&
                      confirmPassword === password &&
                      !errors.confirmPassword && (
                        <p className="text-sm text-green-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                          <Check className="h-3 w-3" />
                          Senhas coincidem
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
                      Criar conta
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
                    Já tem uma conta?{" "}
                    <Link
                      href="/login"
                      className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
                    >
                      Faça login
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Ao criar uma conta, você concorda com nossos{" "}
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

      {/* Email confirmation dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-4 bg-gradient-to-br from-primary to-primary/80 rounded-full text-white shadow-lg">
                  <MailCheck className="h-8 w-8" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-2xl">Verifique seu e-mail</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Enviamos um link de confirmação para:
              <br />
              <span className="font-semibold text-foreground">
                {registeredEmail}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 rounded-lg p-4 my-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Importante:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Verifique também a caixa de spam</li>
                  <li>O link expira em 24 horas</li>
                  <li>Clique no link para ativar sua conta</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/login">
                Ir para o Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowEmailDialog(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
