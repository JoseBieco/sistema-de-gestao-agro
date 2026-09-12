"use server"

import { getParceiros } from "@/app/parceiros/actions"
import { getAnimais } from "@/app/animais/actions"

export async function getTransactionFormData(tipo: string) {
  const parceiros = await getParceiros();
  const parceiroTipo = tipo === "compra" ? "vendedor" : "comprador";
  
  const animais = await getAnimais();
  
  return {
    parceiros: parceiros.filter(p => p.ativo && (p.tipo === parceiroTipo || p.tipo === "ambos")),
    animais: animais.filter(a => a.status === "ATIVO")
  }
}
