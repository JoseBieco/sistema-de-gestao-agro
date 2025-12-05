"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  initialUrl?: string | null; // URL que já existe (edição)
  onFileChange: (file: File | null) => void; // Devolve o arquivo para o pai
  label: string;
}

export function ImageUpload({
  initialUrl,
  onFileChange,
  label,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);

  // Atualiza preview se a prop mudar (ex: carregou dados do banco)
  useEffect(() => {
    if (initialUrl) setPreview(initialUrl);
  }, [initialUrl]);

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Cria URL temporária apenas para mostrar na tela
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Manda o arquivo real para o formulário pai
    onFileChange(file);
  }

  function handleRemove() {
    setPreview(null);
    onFileChange(null); // Avisa o pai que removeu
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {preview ? (
        <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
          <Image fill src={preview} alt="Preview" className="object-cover" />
          <Button
            type="button"
            onClick={handleRemove}
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full max-w-xs"
            onClick={() => document.getElementById(`upload-${label}`)?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Selecionar Imagem
          </Button>
          <input
            id={`upload-${label}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelect}
          />
        </div>
      )}
    </div>
  );
}
