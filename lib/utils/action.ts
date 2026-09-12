export async function safeAction<T>(promise: Promise<T>): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro desconhecido" };
  }
}
