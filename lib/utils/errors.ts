/**
 * Converte um erro (normalmente vindo do Prisma/Postgres) numa mensagem seg
 * ura para exibir ao usuário, sem vazar detalhes internos do banco de dados
 * (nomes de tabela/coluna, texto de constraint, stack trace etc.).
 *
 * O erro original é sempre registrado no console do servidor para depuração.
 *
 * Erros de validação/regra de negócio lançados pelo próprio código
 * (`throw new Error("mensagem amigável")`) são repassados como estão, pois
 * já foram escritos para serem lidos pelo usuário.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro ao processar sua solicitação. Tente novamente."
): string {
  console.error(error);

  if (error && typeof error === "object") {
    const err = error as { code?: string; clientVersion?: string };

    // Códigos conhecidos do Prisma Client
    // https://www.prisma.io/docs/orm/reference/error-reference
    switch (err.code) {
      case "P2002":
        return "Já existe um registro com esses dados (valor duplicado).";
      case "P2003":
        return "Não é possível concluir: este registro está vinculado a outros dados.";
      case "P2025":
        return "Registro não encontrado.";
    }

    // Outro erro do Prisma/driver de banco que não mapeamos explicitamente:
    // não repassa a mensagem crua (pode conter nomes de tabela/coluna/SQL).
    if (err.clientVersion || (typeof err.code === "string" && err.code.startsWith("P"))) {
      return fallback;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
