import { createClient } from "@/lib/supabase/client";

export async function uploadFile(
  file: File,
  bucket: string = "documentos"
): Promise<string | null> {
  const supabase = createClient();

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error("Erro no upload Supabase:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return null;
  }
}
