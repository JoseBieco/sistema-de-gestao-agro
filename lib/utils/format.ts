// Utilitários de formatação

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date))
}

export function formatDateInput(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatDocument(doc: string): string {
  const cleaned = doc.replace(/\D/g, "")
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
  }
  return doc
}

export function calcularIdade(dataNascimento: string): string {
  const nascimento = new Date(dataNascimento)
  const hoje = new Date()

  let anos = hoje.getFullYear() - nascimento.getFullYear()
  let meses = hoje.getMonth() - nascimento.getMonth()

  if (meses < 0) {
    anos--
    meses += 12
  }

  if (anos > 0) {
    return `${anos} ano${anos > 1 ? "s" : ""}${meses > 0 ? ` e ${meses} mes${meses > 1 ? "es" : ""}` : ""}`
  }

  return `${meses} mes${meses > 1 ? "es" : ""}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ativo: "bg-emerald-100 text-emerald-800",
    vendido: "bg-blue-100 text-blue-800",
    morto: "bg-gray-100 text-gray-800",
    transferido: "bg-amber-100 text-amber-800",
    pendente: "bg-amber-100 text-amber-800",
    aplicada: "bg-emerald-100 text-emerald-800",
    atrasada: "bg-red-100 text-red-800",
    cancelada: "bg-gray-100 text-gray-800",
    pago: "bg-emerald-100 text-emerald-800",
    atrasado: "bg-red-100 text-red-800",
    finalizada: "bg-emerald-100 text-emerald-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}
