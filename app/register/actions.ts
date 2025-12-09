"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Captura os dados do formulário
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // Cria o usuário no Supabase Auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Salva o nome nos metadados do usuário (auth.users)
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // O comportamento padrão do Supabase é exigir confirmação de email.
  // Se o email não precisar de confirmação (configuração do projeto), ele já loga.
  // Caso precise, o usuário deve verificar o email antes.

  revalidatePath("/", "layout");
  redirect("/");
}
